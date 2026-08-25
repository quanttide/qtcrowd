import '../models/my_claim.dart';
import 'file_store.dart';

/// 我的认领仓储（DDD 仓储接口）——参与端本地数据，不写管理端。
abstract interface class MyTaskRepository {
  Future<List<MyClaim>> findAll();
  Future<MyClaim?> findByTaskName(String taskName);

  /// 认领 = 记一条本地记录；同任务重复认领为覆盖（幂等）。
  Future<void> save(MyClaim claim);
}

/// InMemory 实现（测试注入 / web 平台）。
class InMemoryMyTaskRepository implements MyTaskRepository {
  InMemoryMyTaskRepository([List<MyClaim>? initial])
      : _items = {for (final c in initial ?? <MyClaim>[]) c.taskName: c};

  final Map<String, MyClaim> _items;

  @override
  Future<List<MyClaim>> findAll() async => List.unmodifiable(_items.values);

  @override
  Future<MyClaim?> findByTaskName(String taskName) async => _items[taskName];

  @override
  Future<void> save(MyClaim claim) async {
    _items[claim.taskName] = claim;
  }
}

/// LocalFile 实现：data/my-tasks.json + 原子写（web 平台不可用）。
class LocalFileMyTaskRepository implements MyTaskRepository {
  LocalFileMyTaskRepository(this.path);

  final String path;

  @override
  Future<List<MyClaim>> findAll() async {
    final items = await readJsonList(path);
    return items.map(MyClaim.fromJson).toList();
  }

  @override
  Future<MyClaim?> findByTaskName(String taskName) async {
    final items = await readJsonList(path);
    for (final m in items) {
      if (m['task_name'] == taskName) return MyClaim.fromJson(m);
    }
    return null;
  }

  @override
  Future<void> save(MyClaim claim) async {
    final items = await readJsonList(path);
    final idx = items.indexWhere((m) => m['task_name'] == claim.taskName);
    if (idx >= 0) {
      items[idx] = claim.toJson();
    } else {
      items.add(claim.toJson());
    }
    await writeJsonList(path, items);
  }
}
