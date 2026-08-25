import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:qtcrowd_studio/models/task.dart';

/// 与 tasks.json 契约一致的完整任务样例（字段覆盖 tasks.schema.json 全量）。
const sampleTaskJson = {
  'name': 'second-brain-init',
  'title': '第二大脑创建插件',
  'description': '把对话流程接入资产云，整理为插件。',
  'business': '量潮云',
  'category': '招聘考核',
  'status': '待认领',
  'background': ['我们有对话流程，希望接入资产云。'],
  'content': ['理解现有流程；', '接入资产云；'],
  'input': ['原始对话导出文件', '格式章程说明'],
  'reference': [
    {'label': '原始数据', 'url': 'https://github.com/example/repo'},
  ],
  'deliverables': ['资产云插件', '使用说明文档'],
  'reward': ['1000 元代金券或 100 元现金（二选一）'],
  'others': ['本任务为悬赏 / 试点任务。'],
  'applyGuide': ['发邮件至 crowd@quanttide.com 报名；'],
};

void main() {
  group('TaskStatus', () {
    test('fromJson 按中文标签解析三种状态', () {
      expect(TaskStatus.fromJson('待认领'), TaskStatus.pending);
      expect(TaskStatus.fromJson('进行中'), TaskStatus.inProgress);
      expect(TaskStatus.fromJson('已关闭'), TaskStatus.closed);
    });

    test('未知状态兜底为待认领', () {
      expect(TaskStatus.fromJson('未知'), TaskStatus.pending);
      expect(TaskStatus.fromJson(null), TaskStatus.pending);
    });
  });

  group('Task', () {
    test('fromJson 全字段解析（对齐 tasks.schema.json 契约）', () {
      final task = Task.fromJson(sampleTaskJson);
      expect(task.name, 'second-brain-init');
      expect(task.title, '第二大脑创建插件');
      expect(task.description, isNotEmpty);
      expect(task.business, '量潮云');
      expect(task.category, '招聘考核');
      expect(task.status, TaskStatus.pending);
      expect(task.background, hasLength(1));
      expect(task.content, hasLength(2));
      expect(task.input, hasLength(2));
      expect(task.reference.single.label, '原始数据');
      expect(task.reference.single.url, 'https://github.com/example/repo');
      expect(task.deliverables, hasLength(2));
      expect(task.reward, hasLength(1));
      expect(task.others, hasLength(1));
      expect(task.applyGuide, hasLength(1));
    });

    test('toJson 往返一致', () {
      final task = Task.fromJson(sampleTaskJson);
      final roundTrip = Task.fromJson(task.toJson());
      expect(roundTrip.name, task.name);
      expect(roundTrip.title, task.title);
      expect(roundTrip.status, task.status);
      expect(roundTrip.content, task.content);
      expect(roundTrip.reference.single.url, task.reference.single.url);
    });

    test('缺失字段兜底为空值（不抛异常）', () {
      final task = Task.fromJson(const {'name': 'x'});
      expect(task.name, 'x');
      expect(task.title, isEmpty);
      expect(task.background, isEmpty);
      expect(task.reference, isEmpty);
    });

    test('claimable：仅待认领可认领', () {
      expect(Task.fromJson(sampleTaskJson).claimable, isTrue);
      expect(
        Task.fromJson({...sampleTaskJson, 'status': '进行中'}).claimable,
        isFalse,
      );
      expect(
        Task.fromJson({...sampleTaskJson, 'status': '已关闭'}).claimable,
        isFalse,
      );
    });

    test('effectiveStatus：已认领的待认领任务视为进行中', () {
      final pending = Task.fromJson(sampleTaskJson);
      expect(pending.effectiveStatus(claimed: true), TaskStatus.inProgress);
      expect(pending.effectiveStatus(claimed: false), TaskStatus.pending);

      final inProgress = Task.fromJson({...sampleTaskJson, 'status': '进行中'});
      expect(inProgress.effectiveStatus(claimed: true), TaskStatus.inProgress);
    });

    test('rewardSummary：报酬首条，无报酬为 null', () {
      expect(Task.fromJson(sampleTaskJson).rewardSummary, contains('代金券'));
      expect(Task.fromJson(const {'name': 'x'}).rewardSummary, isNull);
    });
  });

  group('parseTaskCatalog', () {
    test('解析 {tasks: [...]} 包裹的任务目录', () {
      final raw = '{"tasks": [${_jsonEncode(sampleTaskJson)}]}';
      final tasks = parseTaskCatalog(raw);
      expect(tasks, hasLength(1));
      expect(tasks.single.name, 'second-brain-init');
    });

    test('空目录解析为空列表', () {
      expect(parseTaskCatalog('{"tasks": []}'), isEmpty);
      expect(parseTaskCatalog('{"tasks": "oops"}'), isEmpty);
    });
  });
}

String _jsonEncode(Object value) {
  // 测试内不用 dart:convert 也行——直接构造字符串太脆，这里简化为手工拼接。
  return const JsonEncoder().convert(value);
}
