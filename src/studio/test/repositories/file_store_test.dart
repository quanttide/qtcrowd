import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:qtcrowd_studio/repositories/file_store.dart';

void main() {
  group('readJsonList / writeJsonList（原子 JSON 文件存储）', () {
    late Directory tempDir;
    late String path;

    setUp(() async {
      tempDir = await Directory.systemTemp.createTemp('file_store_test');
      path = '${tempDir.path}/data.json';
    });

    tearDown(() async {
      await tempDir.delete(recursive: true);
    });

    test('失败路径：文件不存在 → 空列表', () async {
      expect(await readJsonList(path), isEmpty);
    });

    test('失败路径：文件内容非 JSON 列表 → 空列表', () async {
      await File(path).writeAsString('{"not": "a list"}');
      expect(await readJsonList(path), isEmpty);
    });

    test('writeJsonList 原子写：落盘可读回，无 .tmp 残留', () async {
      await writeJsonList(path, [
        {'id': 'a'},
        {'id': 'b'},
      ]);
      expect(File('$path.tmp').existsSync(), isFalse);
      final items = await readJsonList(path);
      expect(items.map((m) => m['id']), ['a', 'b']);
    });
  });

  group('studioDataPath（QTCLOUD_CROWD_STUDIO_DATA 数据目录）', () {
    test('默认目录为 data/，可覆盖目录下挂文件名', () {
      // 测试进程未设置 QTCLOUD_CROWD_STUDIO_DATA 时走默认 data/；
      // 环境变量覆盖逻辑在 file_store_io.studioDataDir 中（io-only）。
      expect(studioDataPath('my-tasks.json'), 'data/my-tasks.json');
      expect(studioDataPath('my-settlements.json'), 'data/my-settlements.json');
    });
  });
}
