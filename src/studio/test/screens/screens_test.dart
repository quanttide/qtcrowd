import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qtcrowd_studio/main.dart';
import 'package:qtcrowd_studio/models/my_claim.dart';
import 'package:qtcrowd_studio/models/settlement.dart';
import 'package:qtcrowd_studio/models/task.dart';
import 'package:qtcrowd_studio/repositories/my_task_repository.dart';
import 'package:qtcrowd_studio/repositories/settlement_repository.dart';
import 'package:qtcrowd_studio/repositories/task_repository.dart';
import 'package:qtcrowd_studio/screens/my_tasks_screen.dart';
import 'package:qtcrowd_studio/screens/settlement_screen.dart';
import 'package:qtcrowd_studio/screens/task_detail_screen.dart';
import 'package:qtcrowd_studio/screens/task_list_screen.dart';

Widget wrap(Widget child) => MaterialApp(home: child);

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
      {'label': '参考$name', 'url': 'https://example.com/$name'},
    ],
    'deliverables': ['交付物$name'],
    'reward': ['1000 元代金券或 100 元现金（二选一）', '也可自报价'],
    'others': ['其他$name'],
    'applyGuide': ['发邮件至 crowd@quanttide.com 报名；', '按交付物清单完成。'],
  });
}

void main() {
  group('TaskListScreen', () {
    testWidgets('渲染任务列表：title / category / business / status / 报酬', (tester) async {
      final repo = InMemoryTaskRepository([
        sampleTask('t1'),
        sampleTask('t2', status: TaskStatus.closed),
      ]);
      await tester.pumpWidget(
        wrap(TaskListScreen(repository: repo, myTasks: InMemoryMyTaskRepository())),
      );
      await tester.pumpAndSettle();

      expect(find.text('任务t1'), findsOneWidget);
      expect(find.text('任务t2'), findsOneWidget);
      expect(find.text('量潮云'), findsNWidgets(2));
      expect(find.text('招聘考核'), findsNWidgets(2));
      expect(find.text('待认领'), findsOneWidget);
      expect(find.text('已关闭'), findsOneWidget);
      expect(find.textContaining('报酬：'), findsNWidgets(2));
    });

    testWidgets('已认领的待认领任务展示为进行中', (tester) async {
      final myTasks = InMemoryMyTaskRepository([
        MyClaim(
          taskName: 't1',
          taskTitle: '任务t1',
          claimedAt: '2026-08-25T10:00:00.000Z',
        ),
      ]);
      final repo = InMemoryTaskRepository([sampleTask('t1')]);
      await tester.pumpWidget(
        wrap(TaskListScreen(repository: repo, myTasks: myTasks)),
      );
      await tester.pumpAndSettle();

      expect(find.text('进行中'), findsOneWidget);
      expect(find.text('待认领'), findsNothing);
    });

    testWidgets('点击任务卡片进入详情页', (tester) async {
      final repo = InMemoryTaskRepository([sampleTask('t1')]);
      await tester.pumpWidget(
        wrap(TaskListScreen(repository: repo, myTasks: InMemoryMyTaskRepository())),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.text('任务t1'));
      await tester.pumpAndSettle();

      expect(find.text('任务背景'), findsOneWidget);
      expect(find.text('如何报名'), findsOneWidget);
    });
  });

  group('TaskDetailScreen', () {
    testWidgets('渲染结构化段落：背景 / 内容 / 输入 / 交付物 / 报酬 / 报名', (tester) async {
      final task = sampleTask('t1');
      await tester.pumpWidget(
        wrap(TaskDetailScreen(task: task, myTasks: InMemoryMyTaskRepository())),
      );
      await tester.pumpAndSettle();

      expect(find.text('任务背景'), findsOneWidget);
      expect(find.text('任务内容'), findsOneWidget);
      expect(find.text('任务输入'), findsOneWidget);
      expect(find.text('参考链接'), findsOneWidget);
      expect(find.text('交付物'), findsOneWidget);
      expect(find.text('报酬 / 结算'), findsOneWidget);
      expect(find.text('如何报名'), findsOneWidget);
      expect(find.text('· 背景t1'), findsOneWidget);
      expect(find.text('· 内容t1'), findsOneWidget);
      expect(find.text('· 交付物t1'), findsOneWidget);
      expect(find.text('· 发邮件至 crowd@quanttide.com 报名；'), findsOneWidget);
    });

    testWidgets('待认领任务显示认领按钮，点击后本地记录并变为进行中', (tester) async {
      final task = sampleTask('t1');
      final myTasks = InMemoryMyTaskRepository();
      await tester.pumpWidget(
        wrap(TaskDetailScreen(task: task, myTasks: myTasks)),
      );
      await tester.pumpAndSettle();

      expect(find.text('认领任务'), findsOneWidget);
      await tester.tap(find.text('认领任务'));
      await tester.pumpAndSettle();

      final claim = await myTasks.findByTaskName('t1');
      expect(claim, isNotNull);
      expect(claim!.taskTitle, '任务t1');
      expect(claim.claimedAt, isNotEmpty);
      // 认领后展示为进行中（本地状态，不写管理端）
      expect(find.text('已认领 · 进行中'), findsOneWidget);
      expect(find.text('待认领'), findsNothing);
    });

    testWidgets('进行中 / 已关闭任务不可认领', (tester) async {
      final inProgress = sampleTask('t2', status: TaskStatus.inProgress);
      await tester.pumpWidget(
        wrap(TaskDetailScreen(task: inProgress, myTasks: InMemoryMyTaskRepository())),
      );
      await tester.pumpAndSettle();
      expect(find.text('已认领 · 进行中'), findsOneWidget);
      expect(find.text('认领任务'), findsNothing);

      final closed = sampleTask('t3', status: TaskStatus.closed);
      await tester.pumpWidget(
        wrap(TaskDetailScreen(task: closed, myTasks: InMemoryMyTaskRepository())),
      );
      await tester.pumpAndSettle();
      expect(find.text('已关闭 · 不可认领'), findsOneWidget);
    });
  });

  group('MyTasksScreen', () {
    testWidgets('渲染认领记录：任务名 + 认领时间 + 进行中', (tester) async {
      final repo = InMemoryMyTaskRepository([
        MyClaim(
          taskName: 't1',
          taskTitle: '任务t1',
          claimedAt: '2026-08-25T10:00:00.000Z',
        ),
      ]);
      await tester.pumpWidget(wrap(MyTasksScreen(repository: repo)));
      await tester.pumpAndSettle();

      expect(find.text('任务t1'), findsOneWidget);
      expect(find.textContaining('认领于'), findsOneWidget);
      expect(find.textContaining('2026-08-25'), findsOneWidget);
      expect(find.text('进行中'), findsOneWidget);
    });

    testWidgets('无认领时展示空态提示', (tester) async {
      await tester.pumpWidget(
        wrap(MyTasksScreen(repository: InMemoryMyTaskRepository())),
      );
      await tester.pumpAndSettle();
      expect(find.textContaining('还没有认领任务'), findsOneWidget);
    });
  });

  group('SettlementScreen', () {
    testWidgets('渲染结算记录列表与新增表单', (tester) async {
      final repo = InMemorySettlementRepository([
        const Settlement(
          id: 's1',
          taskName: 'second-brain-init',
          amount: 100,
          settledAt: '2026-08-25T10:00:00.000Z',
        ),
      ]);
      await tester.pumpWidget(wrap(SettlementScreen(repository: repo)));
      await tester.pumpAndSettle();

      expect(find.text('新增一笔（按量潮标准结算）'), findsOneWidget);
      expect(find.text('任务名称'), findsOneWidget);
      expect(find.text('金额（元）'), findsOneWidget);
      expect(find.text('¥ 100.00'), findsOneWidget);
      expect(find.textContaining('second-brain-init'), findsOneWidget);
      expect(find.text('记一笔'), findsOneWidget);
    });

    testWidgets('记一笔：金额合法 → 记录新增', (tester) async {
      final repo = InMemorySettlementRepository();
      await tester.pumpWidget(wrap(SettlementScreen(repository: repo)));
      await tester.pumpAndSettle();

      await tester.enterText(find.byType(TextField).at(0), 'second-brain-init');
      await tester.enterText(find.byType(TextField).at(1), '66.5');
      await tester.tap(find.text('记一笔'));
      await tester.pumpAndSettle();

      final all = await repo.findAll();
      expect(all.length, 1);
      expect(all.single.taskName, 'second-brain-init');
      expect(all.single.amount, 66.5);
      expect(find.text('¥ 66.50'), findsOneWidget);
    });

    testWidgets('失败路径：金额不合法 → 提示且不新增', (tester) async {
      final repo = InMemorySettlementRepository();
      await tester.pumpWidget(wrap(SettlementScreen(repository: repo)));
      await tester.pumpAndSettle();

      await tester.enterText(find.byType(TextField).at(0), 'second-brain-init');
      await tester.enterText(find.byType(TextField).at(1), '-5');
      await tester.tap(find.text('记一笔'));
      await tester.pumpAndSettle();

      expect(find.text('请填写任务名称和大于 0 的金额'), findsOneWidget);
      expect(await repo.findAll(), isEmpty);
    });
  });

  group('App 接线（main.dart）', () {
    testWidgets('底部导航三页切换：任务 / 我的认领 / 结算', (tester) async {
      final app = QtCrowdStudioApp(
        repositories: AppRepositories(
          tasks: InMemoryTaskRepository([sampleTask('t1')]),
          myTasks: InMemoryMyTaskRepository(),
          settlements: InMemorySettlementRepository(),
        ),
      );
      await tester.pumpWidget(app);
      await tester.pumpAndSettle();

      // 首页 = 任务列表（真实任务数据渲染）
      expect(find.text('任务t1'), findsOneWidget);
      // 「任务」同时是 AppBar 标题与导航标签
      expect(find.text('任务'), findsNWidgets(2));
      expect(find.text('我的认领'), findsOneWidget);
      expect(find.text('结算'), findsOneWidget);

      await tester.tap(find.text('我的认领'));
      await tester.pumpAndSettle();
      expect(find.textContaining('还没有认领任务'), findsOneWidget);

      await tester.tap(find.text('结算'));
      await tester.pumpAndSettle();
      expect(find.text('新增一笔（按量潮标准结算）'), findsOneWidget);
    });
  });
}
