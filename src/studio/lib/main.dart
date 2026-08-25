import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import 'repositories/file_store.dart';
import 'repositories/my_task_repository.dart';
import 'repositories/settlement_repository.dart';
import 'repositories/task_repository.dart';
import 'screens/my_tasks_screen.dart';
import 'screens/settlement_screen.dart';
import 'screens/task_list_screen.dart';

/// 仓储集合（三件套接线入口）。
class AppRepositories {
  const AppRepositories({
    required this.tasks,
    required this.myTasks,
    required this.settlements,
  });

  /// 任务目录（只读，资产 tasks.json——与 site 同一数据源）。
  final TaskRepository tasks;

  /// 我的认领（本地 data/my-tasks.json，QTCLOUD_CROWD_STUDIO_DATA 可覆盖目录）。
  final MyTaskRepository myTasks;

  /// 我的结算（本地 data/my-settlements.json）。
  final SettlementRepository settlements;
}

/// 创建仓储：任务目录始终走资产；本地认领 / 结算
/// 非 web 用 LocalFile（JSON 原子写），web 平台无 dart:io 用 InMemory。
AppRepositories createRepositories() {
  final tasks = AssetTaskRepository();
  if (kIsWeb) {
    return AppRepositories(
      tasks: tasks,
      myTasks: InMemoryMyTaskRepository(),
      settlements: InMemorySettlementRepository(),
    );
  }
  return AppRepositories(
    tasks: tasks,
    myTasks: LocalFileMyTaskRepository(studioDataPath('my-tasks.json')),
    settlements:
        LocalFileSettlementRepository(studioDataPath('my-settlements.json')),
  );
}

void main() {
  runApp(QtCrowdStudioApp(repositories: createRepositories()));
}

/// 量潮众包·参与端工作室：渠道 / 代理 / 实训成员的任务认领与结算工作台。
class QtCrowdStudioApp extends StatelessWidget {
  const QtCrowdStudioApp({super.key, required this.repositories});

  final AppRepositories repositories;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '量潮众包·参与端',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.teal),
        useMaterial3: true,
      ),
      home: HomeShell(repositories: repositories),
    );
  }
}

class HomeShell extends StatefulWidget {
  const HomeShell({super.key, required this.repositories});

  final AppRepositories repositories;

  @override
  State<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends State<HomeShell> {
  int _index = 0;

  @override
  Widget build(BuildContext context) {
    final pages = [
      TaskListScreen(
        repository: widget.repositories.tasks,
        myTasks: widget.repositories.myTasks,
      ),
      MyTasksScreen(repository: widget.repositories.myTasks),
      SettlementScreen(repository: widget.repositories.settlements),
    ];
    return Scaffold(
      body: pages[_index],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (i) => setState(() => _index = i),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.task_alt),
            label: '任务',
          ),
          NavigationDestination(
            icon: Icon(Icons.handshake_outlined),
            label: '我的认领',
          ),
          NavigationDestination(
            icon: Icon(Icons.payments),
            label: '结算',
          ),
        ],
      ),
    );
  }
}
