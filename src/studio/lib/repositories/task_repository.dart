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

/// 资产实现：从打包的 assets/data/tasks.json 读取任务目录。
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
