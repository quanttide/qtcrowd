/// 原子 JSON 文件存储（列表）。
///
/// - 读：文件不存在/为空 → 返回空列表；
/// - 写：先写临时文件再 rename（原子写，避免半写坏文件）。
///
/// web 平台没有 dart:io，LocalFile 仓储不可用——由
/// `file_store_stub.dart` 提供占位，main.dart 在 web 下改用 InMemory。
library;

import 'dart:convert';

import 'file_store_stub.dart'
    if (dart.library.io) 'file_store_io.dart' as store;

/// 读取 JSON 列表文件；文件不存在或内容为空时返回空列表。
Future<List<Map<String, dynamic>>> readJsonList(String path) async {
  final raw = await store.readFile(path);
  if (raw == null || raw.trim().isEmpty) return [];
  final decoded = jsonDecode(raw);
  if (decoded is! List) return [];
  return decoded.whereType<Map<String, dynamic>>().toList();
}

/// 原子写入 JSON 列表文件。
Future<void> writeJsonList(
  String path,
  List<Map<String, dynamic>> items,
) {
  final content = const JsonEncoder.withIndent('  ').convert(items);
  return store.writeFileAtomic(path, content);
}

/// studio 本地数据目录：`QTCLOUD_CROWD_STUDIO_DATA` 环境变量可覆盖，默认 `data`。
///
/// 参与端自己的数据（认领 / 结算）只写这个目录，不写管理端数据。
String studioDataDir() => store.studioDataDir();

/// 数据文件完整路径（目录下挂文件名）。
String studioDataPath(String fileName) => '${studioDataDir()}/$fileName';
