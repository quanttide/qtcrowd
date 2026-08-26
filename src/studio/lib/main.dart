import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import 'repositories/claim_api.dart';
import 'repositories/file_store.dart';
import 'repositories/my_task_repository.dart';
import 'repositories/settlement_repository.dart';
import 'repositories/task_repository.dart';
import 'screens/my_tasks_screen.dart';
import 'screens/settlement_screen.dart';
import 'screens/task_list_screen.dart';

/// 数据源配置（dart-define，运行时不可改）：
///   --dart-define=QTCLOUD_CROWD_PROVIDER_URL=https://api.crowd.quanttide.com 前台唯一服务端（qtcrowd-provider）根 URL：任务列表读 + 认领/交付写都经它
///   --dart-define=QTCLOUD_CROWD_BACKEND_API=https://api.example.com 后台 API 根 URL（provider 未配置时的直连回退）
///   --dart-define=QTCLOUD_CROWD_PARTNER_ID=<参与端身份标识>         认领 body partner_id
/// 读：PROVIDER_URL 配置时经 qtcrowd-provider 数据 API（{url}/api/tasks）；未配置回退打包
/// assets tasks.json（开发兜底）。
/// 写：PROVIDER_URL（qtcrowd-provider 转发）→ BACKEND_API（后台直连）→ 本地 mock。
const _providerUrl = String.fromEnvironment('QTCLOUD_CROWD_PROVIDER_URL');
const _backendApi = String.fromEnvironment('QTCLOUD_CROWD_BACKEND_API');

/// 仓储集合（三件套接线入口）。
class AppRepositories {
  const AppRepositories({
    required this.tasks,
    required this.myTasks,
    required this.settlements,
    required this.claimApi,
  });

  /// 任务目录（qtcrowd-provider 数据 API：PROVIDER_URL 配置时，否则资产 tasks.json 兜底）。
  final TaskRepository tasks;

  /// 我的认领（本地 data/my-tasks.json，QTCLOUD_CROWD_STUDIO_DATA 可覆盖目录）。
  final MyTaskRepository myTasks;

  /// 我的结算（本地 data/my-settlements.json）。
  final SettlementRepository settlements;

  /// 认领写回 API（PROVIDER_URL 配置时经 qtcrowd-provider 转发，否则 BACKEND_API
  /// 直连后台；都未配置时本地 mock）。
  final ClaimApi claimApi;
}

/// 创建仓储：任务目录按 PROVIDER_URL 选 qtcrowd-provider 数据 API / 资产兜底；认领按
/// PROVIDER_URL → BACKEND_API → 本地 mock 三级回退。本地认领 / 结算非 web 用
/// LocalFile（JSON 原子写），web 平台无 dart:io 用 InMemory。
AppRepositories createRepositories() {
  final tasks = _providerUrl.isNotEmpty
      ? HttpTaskRepository(_providerUrl)
      : AssetTaskRepository();
  final claimApi = _providerUrl.isNotEmpty
      ? HttpClaimApi(_providerUrl)
      : _backendApi.isNotEmpty
          ? HttpClaimApi(_backendApi)
          : MockClaimApi();
  if (kIsWeb) {
    return AppRepositories(
      tasks: tasks,
      myTasks: InMemoryMyTaskRepository(),
      settlements: InMemorySettlementRepository(),
      claimApi: claimApi,
    );
  }
  return AppRepositories(
    tasks: tasks,
    myTasks: LocalFileMyTaskRepository(studioDataPath('my-tasks.json')),
    settlements:
        LocalFileSettlementRepository(studioDataPath('my-settlements.json')),
    claimApi: claimApi,
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
        claimApi: widget.repositories.claimApi,
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
