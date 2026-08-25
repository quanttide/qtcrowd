import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:qtcrowd_studio/models/settlement.dart';
import 'package:qtcrowd_studio/repositories/settlement_repository.dart';

Settlement sampleSettlement(String id) => Settlement(
      id: id,
      taskName: 'task_$id',
      amount: 100,
      settledAt: '2026-08-25T10:00:00.000Z',
    );

void main() {
  group('InMemorySettlementRepository', () {
    test('findAll 返回注入的初始数据', () async {
      final repo = InMemorySettlementRepository([
        sampleSettlement('s1'),
        sampleSettlement('s2'),
      ]);
      expect((await repo.findAll()).length, 2);
    });

    test('save 新增与覆盖（同 id 只保留一条）', () async {
      final repo = InMemorySettlementRepository();
      await repo.save(sampleSettlement('s1'));
      await repo.save(Settlement(
        id: 's1',
        taskName: 'task_s1',
        amount: 200,
        settledAt: '2026-08-26T00:00:00.000Z',
      ));
      final all = await repo.findAll();
      expect(all.length, 1);
      expect(all.single.amount, 200);
    });

    test('失败路径：findById 不存在返回 null', () async {
      final repo = InMemorySettlementRepository();
      expect(await repo.findById('missing'), isNull);
    });

    test('失败路径：空仓储 findAll 返回空列表', () async {
      final repo = InMemorySettlementRepository();
      expect(await repo.findAll(), isEmpty);
    });
  });

  group('LocalFileSettlementRepository（原子写，data/my-settlements.json 同款）', () {
    late Directory tempDir;
    late String path;

    setUp(() async {
      tempDir = await Directory.systemTemp.createTemp('settlement_repo_test');
      path = '${tempDir.path}/my-settlements.json';
    });

    tearDown(() async {
      await tempDir.delete(recursive: true);
    });

    test('失败路径：文件不存在 → findAll 空列表、findById null', () async {
      final repo = LocalFileSettlementRepository(path);
      expect(await repo.findAll(), isEmpty);
      expect(await repo.findById('s1'), isNull);
    });

    test('save 后落盘，可重新读出（持久化）', () async {
      final repo = LocalFileSettlementRepository(path);
      await repo.save(sampleSettlement('s1'));
      await repo.save(sampleSettlement('s2'));

      final repo2 = LocalFileSettlementRepository(path);
      final all = await repo2.findAll();
      expect(all.length, 2);
      expect(all.first.taskName, 'task_s1');
    });

    test('同 id 重复 save 覆盖而不是追加', () async {
      final repo = LocalFileSettlementRepository(path);
      await repo.save(sampleSettlement('s1'));
      await repo.save(Settlement(
        id: 's1',
        taskName: 'task_s1',
        amount: 999,
        settledAt: '2026-08-26T00:00:00.000Z',
      ));
      expect((await LocalFileSettlementRepository(path).findAll()).length, 1);
      expect(
        (await LocalFileSettlementRepository(path).findById('s1'))!.amount,
        999,
      );
    });

    test('原子写：写完后无 .tmp 残留文件', () async {
      final repo = LocalFileSettlementRepository(path);
      await repo.save(sampleSettlement('s1'));
      expect(File('$path.tmp').existsSync(), isFalse);
      expect(File(path).existsSync(), isTrue);
    });
  });
}
