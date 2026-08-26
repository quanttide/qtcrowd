import 'dart:convert';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:qtcrowd_studio/models/task.dart';
import 'package:qtcrowd_studio/repositories/task_repository.dart';

/// 与 tasks.json 契约一致的样例任务。
Task sampleTask(String name, {TaskStatus status = TaskStatus.pending}) {
  return Task.fromJson({
    'name': name,
    'title': '任务$name',
    'description': '一句话描述$name',
    'business': '量潮云',
    'category': '招聘考核',
    'status': status.label,
    'background': ['背景$name'],
    'content': ['内容$name'],
    'input': ['输入$name'],
    'reference': [
      {'label': '参考$name', 'url': null},
    ],
    'deliverables': ['交付物$name'],
    'reward': ['报酬$name'],
    'others': ['其他$name'],
    'applyGuide': ['报名$name'],
  });
}

void main() {
  group('InMemoryTaskRepository', () {
    test('findAll 返回注入的初始数据', () async {
      final repo = InMemoryTaskRepository([sampleTask('t1'), sampleTask('t2')]);
      expect((await repo.findAll()).length, 2);
    });

    test('findByName 按 name 查找', () async {
      final repo = InMemoryTaskRepository([sampleTask('t1')]);
      expect((await repo.findByName('t1'))?.title, '任务t1');
    });

    test('失败路径：findByName 不存在返回 null', () async {
      final repo = InMemoryTaskRepository();
      expect(await repo.findByName('missing'), isNull);
    });

    test('失败路径：空仓储 findAll 返回空列表', () async {
      final repo = InMemoryTaskRepository();
      expect(await repo.findAll(), isEmpty);
    });
  });

  group('AssetTaskRepository（打包资产 tasks.json，与 site 同一数据源）', () {
    testWidgets('从资产读取任务目录并可按 name 查找', (tester) async {
      final repo = AssetTaskRepository();
      final tasks = await repo.findAll();

      expect(tasks, isNotEmpty,
          reason: '任务目录不应为空（真实数据源 data/profile，不自创占位数据）');
      final first = tasks.first;
      expect(first.name, isNotEmpty);
      expect(first.title, isNotEmpty);
      expect(first.reward, isNotEmpty, reason: '明码标价：报酬不能为空');

      final byName = await repo.findByName(first.name);
      expect(byName?.name, first.name);
    });
  });

  group('真实任务数据（assets/data/tasks.json，与 site 同一数据源）', () {
    test('任务文件存在且解析为合法任务目录', () async {
      final file = File('assets/data/tasks.json');
      expect(file.existsSync(), isTrue,
          reason: '缺少任务数据，请运行 node scripts/sync-tasks.mjs');

      final raw = await file.readAsString();
      final decoded = jsonDecode(raw) as Map<String, dynamic>;
      final tasks = (decoded['tasks'] as List)
          .whereType<Map<String, dynamic>>()
          .map(Task.fromJson)
          .toList();

      expect(tasks, isNotEmpty,
          reason: '任务目录不应为空（真实数据源 data/profile，不自创占位数据）');
      for (final task in tasks) {
        expect(task.name, isNotEmpty, reason: 'name 必填（路由 / key）');
        expect(task.title, isNotEmpty);
        expect(task.business, isNotEmpty);
        expect(task.category, isNotEmpty);
        expect(task.status, isA<TaskStatus>());
        expect(task.reward, isNotEmpty, reason: '明码标价：报酬不能为空');
        expect(task.applyGuide, isNotEmpty, reason: '如何报名不能为空');
      }
    });
  });

  group('HttpTaskRepository（公开数据层：QTCLOUD_CROWD_PUBLIC_URL）', () {
    const publishedCatalog = {
      'tasks': [
        {
          'id': 't1',
          'title': '公开任务一',
          'description': '一句话',
          'reward': ['100 元'],
          'applyGuide': ['发邮件报名'],
        },
      ],
    };

    test('从公开数据源拉取 published 任务（聚合 tasks.json）', () async {
      final client = MockClient((request) async {
        expect(request.url.toString(), 'https://cdn.example.com/tasks.json');
        return http.Response(
            jsonEncode(publishedCatalog), 200,
            headers: {'content-type': 'application/json; charset=utf-8'},
          );
      });
      final repo = HttpTaskRepository('https://cdn.example.com', client: client);

      final tasks = await repo.findAll();
      expect(tasks, hasLength(1));
      expect(tasks.single.name, 't1', reason: '公开任务主键 id 回退 name');
      expect(tasks.single.title, '公开任务一');
      expect(tasks.single.reward, ['100 元']);
      expect(tasks.single.applyGuide, ['发邮件报名']);
    });

    test('聚合 tasks.json 404 → 回退 public/tasks/index.json', () async {
      final client = MockClient((request) async {
        if (request.url.path.endsWith('/tasks.json')) {
          return http.Response('not found', 404);
        }
        return http.Response(
            jsonEncode(publishedCatalog), 200,
            headers: {'content-type': 'application/json; charset=utf-8'},
          );
      });
      final repo = HttpTaskRepository('https://cdn.example.com', client: client);

      final tasks = await repo.findAll();
      expect(tasks, hasLength(1));
      expect(tasks.single.name, 't1');
    });

    test('findByName 从公开数据源查找', () async {
      final client = MockClient(
        (request) async => http.Response(
          jsonEncode(publishedCatalog),
          200,
          headers: {'content-type': 'application/json; charset=utf-8'},
        ),
      );
      final repo = HttpTaskRepository('https://cdn.example.com', client: client);

      final found = await repo.findByName('t1');
      expect(found?.title, '公开任务一');
      expect(await repo.findByName('missing'), isNull);
    });

    test('公开数据源全部不可用 → 抛错不静默', () async {
      final client = MockClient(
        (request) async => http.Response('server error', 500),
      );
      final repo = HttpTaskRepository('https://cdn.example.com', client: client);

      expect(repo.findAll(), throwsA(isA<Exception>()));
    });
  });
}
