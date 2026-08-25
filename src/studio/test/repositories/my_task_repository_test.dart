import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:qtcrowd_studio/models/my_claim.dart';
import 'package:qtcrowd_studio/repositories/my_task_repository.dart';

MyClaim sampleClaim(String taskName, {String? claimedAt}) => MyClaim(
      taskName: taskName,
      taskTitle: '任务$taskName',
      claimedAt: claimedAt ?? '2026-08-25T10:00:00.000Z',
    );

void main() {
  group('InMemoryMyTaskRepository', () {
    test('findAll 返回注入的初始数据', () async {
      final repo = InMemoryMyTaskRepository([
        sampleClaim('t1'),
        sampleClaim('t2'),
      ]);
      expect((await repo.findAll()).length, 2);
    });

    test('save 同任务重复认领为覆盖（幂等，只留一条）', () async {
      final repo = InMemoryMyTaskRepository();
      await repo.save(sampleClaim('t1'));
      await repo.save(sampleClaim('t1', claimedAt: '2026-08-26T00:00:00.000Z'));
      final all = await repo.findAll();
      expect(all.length, 1);
      expect(all.single.claimedAt, '2026-08-26T00:00:00.000Z');
    });

    test('失败路径：findByTaskName 未认领返回 null', () async {
      final repo = InMemoryMyTaskRepository();
      expect(await repo.findByTaskName('missing'), isNull);
    });

    test('失败路径：空仓储 findAll 返回空列表', () async {
      final repo = InMemoryMyTaskRepository();
      expect(await repo.findAll(), isEmpty);
    });
  });

  group('LocalFileMyTaskRepository（原子写，data/my-tasks.json 同款）', () {
    late Directory tempDir;
    late String path;

    setUp(() async {
      tempDir = await Directory.systemTemp.createTemp('my_task_repo_test');
      path = '${tempDir.path}/my-tasks.json';
    });

    tearDown(() async {
      await tempDir.delete(recursive: true);
    });

    test('失败路径：文件不存在 → findAll 空列表、findByTaskName null', () async {
      final repo = LocalFileMyTaskRepository(path);
      expect(await repo.findAll(), isEmpty);
      expect(await repo.findByTaskName('t1'), isNull);
    });

    test('save 后落盘，可重新读出（持久化）', () async {
      final repo = LocalFileMyTaskRepository(path);
      await repo.save(sampleClaim('t1'));
      await repo.save(sampleClaim('t2'));

      final repo2 = LocalFileMyTaskRepository(path);
      final all = await repo2.findAll();
      expect(all.length, 2);
      expect(all.first.taskTitle, '任务t1');
    });

    test('同任务重复 save 覆盖而不是追加', () async {
      final repo = LocalFileMyTaskRepository(path);
      await repo.save(sampleClaim('t1'));
      await repo.save(sampleClaim('t1', claimedAt: '2026-08-26T00:00:00.000Z'));
      final all = await LocalFileMyTaskRepository(path).findAll();
      expect(all.length, 1);
      expect(
        (await LocalFileMyTaskRepository(path).findByTaskName('t1'))!
            .claimedAt,
        '2026-08-26T00:00:00.000Z',
      );
    });

    test('原子写：写完后无 .tmp 残留文件', () async {
      final repo = LocalFileMyTaskRepository(path);
      await repo.save(sampleClaim('t1'));
      expect(File('$path.tmp').existsSync(), isFalse);
      expect(File(path).existsSync(), isTrue);
    });
  });
}
