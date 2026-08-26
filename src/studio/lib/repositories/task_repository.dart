import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:flutter/services.dart';

import '../models/task.dart';

/// 任务仓储（DDD 仓储接口）——任务目录只读。
abstract interface class TaskRepository {
  Future<List<Task>> findAll();
  Future<Task?> findByName(String name);
}

/// InMemory 实现（测试注入）。
class InMemoryTaskRepository implements TaskRepository {
  InMemoryTaskRepository([List<Task>? initial])
      : _items = {for (final t in initial ?? <Task>[]) t.name: t};

  final Map<String, Task> _items;

  @override
  Future<List<Task>> findAll() async => List.unmodifiable(_items.values);

  @override
  Future<Task?> findByName(String name) async => _items[name];
}

/// 资产实现：从打包的 assets/data/tasks.json 读取任务目录（PUBLIC_URL 未配置时的开发兜底）。
///
/// 该文件由 scripts/sync-tasks.mjs 从 site 的 tasks.json 同步
/// （同一数据源，与 site 一致），见 AGENTS.md。
class AssetTaskRepository implements TaskRepository {
  AssetTaskRepository({this.assetPath = 'assets/data/tasks.json'});

  final String assetPath;

  @override
  Future<List<Task>> findAll() async {
    final raw = await rootBundle.loadString(assetPath);
    return parseTaskCatalog(raw);
  }

  @override
  Future<Task?> findByName(String name) async {
    final tasks = await findAll();
    for (final t in tasks) {
      if (t.name == name) return t;
    }
    return null;
  }
}

/// 公开数据层实现：从公开桶/CDN（QTCLOUD_CROWD_PUBLIC_URL）拉取 published 任务。
///
/// 与 site 同源：先试 {url}/tasks.json 聚合，404/失败回退 {url}/public/tasks/index.json
/// （对应后台发布的 public/tasks/{id}.json 列表）；全部失败抛错不静默。
/// 公开任务主键是 id（public/tasks/{id}.json），缺 name 时回退用 id。
class HttpTaskRepository implements TaskRepository {
  HttpTaskRepository(this.baseUrl, {http.Client? client})
      : _client = client ?? http.Client();

  final String baseUrl;
  final http.Client _client;

  @override
  Future<List<Task>> findAll() async {
    final candidates = [
      '$baseUrl/tasks.json',
      '$baseUrl/public/tasks/index.json',
    ];
    Object? lastError = Exception('公开数据源不可用：$baseUrl');
    for (final url in candidates) {
      try {
        final res = await _client.get(Uri.parse(url));
        if (res.statusCode != 200) {
          lastError = Exception('公开数据源 $url 返回 HTTP ${res.statusCode}');
          continue;
        }
        final tasks = parsePublishedTaskCatalog(res.body);
        if (tasks.isEmpty) {
          // 聚合存在但内容为空 → 视为已拉取成功（当前无可接任务）
          return const [];
        }
        return List.unmodifiable(tasks);
      } catch (e) {
        lastError = e;
      }
    }
    throw lastError!;
  }

  @override
  Future<Task?> findByName(String name) async {
    final tasks = await findAll();
    for (final t in tasks) {
      if (t.name == name) return t;
    }
    return null;
  }
}

/// 公开任务目录解析（兼容 {tasks: [...]} 聚合与裸数组；主键 id 回退 name）。
List<Task> parsePublishedTaskCatalog(String raw) {
  final decoded = jsonDecode(raw);
  final list = decoded is Map<String, dynamic> ? decoded['tasks'] : decoded;
  if (list is! List) return const [];
  return list.whereType<Map<String, dynamic>>().map((raw) {
    final task = Task.fromJson(raw);
    if (task.name.isEmpty && raw['id'] is String) {
      return Task.fromJson({...raw, 'name': raw['id']});
    }
    return task;
  }).toList();
}
