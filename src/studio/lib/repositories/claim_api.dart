/// 认领写回 API：前台（studio）认领写操作经 qtcrowd-provider 转发（默认），
/// 或直连后台 API（provider 未配置时回退），成功后写本地记录。
///
/// 后台契约（qtcloud-crowd provider）：
///   POST {PROVIDER_URL}/api/tasks/{id}/claim   （qtcrowd-provider 转发，body 原样透传）
///   body: {"partner_id": "..."}
///   状态机：published → accepted；非 published 返回 4xx（非法状态，不写本地）。
///
/// 本地开发未配置 QTCLOUD_CROWD_PROVIDER_URL / QTCLOUD_CROWD_BACKEND_API 时用
/// [MockClaimApi]（默认成功）。
library;

import 'dart:convert';

import 'package:http/http.dart' as http;

/// 认领异常（用户可读提示）。
class ClaimException implements Exception {
  ClaimException(this.message);

  final String message;

  @override
  String toString() => message;
}

/// 认领 API 抽象（可注入 mock / http 实现）。
abstract interface class ClaimApi {
  /// 认领任务：后台 published → accepted；成功返回，失败抛 [ClaimException]。
  Future<void> claim({required String taskId, required String partnerId});
}

/// HTTP 实现：POST {baseUrl}/api/tasks/{id}/claim（body partner_id）。
/// baseUrl 为 qtcrowd-provider（QTCLOUD_CROWD_PROVIDER_URL）或后台
/// （QTCLOUD_CROWD_BACKEND_API 直连回退），契约一致。
class HttpClaimApi implements ClaimApi {
  HttpClaimApi(this.baseUrl, {http.Client? client})
      : _client = client ?? http.Client();

  final String baseUrl;
  final http.Client _client;

  @override
  Future<void> claim({required String taskId, required String partnerId}) async {
    if (partnerId.isEmpty) {
      throw ClaimException('请先配置 QTCLOUD_CROWD_PARTNER_ID（参与端身份标识）再认领');
    }
    final uri = Uri.parse('$baseUrl/api/tasks/$taskId/claim');
    late http.Response res;
    try {
      res = await _client.post(
        uri,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'partner_id': partnerId}),
      );
    } catch (e) {
      throw ClaimException('网络错误：无法连接后台（${e.runtimeType}），请稍后重试');
    }
    if (res.statusCode >= 200 && res.statusCode < 300) return;
    throw ClaimException(claimErrorMessage(res.statusCode));
  }
}

/// 后台错误 → 用户可读提示。
String claimErrorMessage(int statusCode) {
  switch (statusCode) {
    case 400:
      return '认领请求无效，请检查后重试';
    case 404:
      return '任务不存在或已下架，无法认领';
    case 409:
      return '任务状态已变化，无法认领（可能已被认领或已关闭）';
    default:
      return '认领失败（后台返回 $statusCode），请稍后重试';
  }
}

/// 认领行为（mock 注入：测试认领流程成功 / 失败 / 非法状态）。
enum MockClaimBehavior { success, networkFailure, invalidState }

/// 本地 mock：未配置 QTCLOUD_CROWD_PROVIDER_URL 与 QTCLOUD_CROWD_BACKEND_API 时的认领实现。
/// 默认成功；可注入失败 / 非法状态供测试与本地验证。
class MockClaimApi implements ClaimApi {
  MockClaimApi([this.behavior = MockClaimBehavior.success]);

  final MockClaimBehavior behavior;

  @override
  Future<void> claim({required String taskId, required String partnerId}) async {
    switch (behavior) {
      case MockClaimBehavior.success:
        return; // 后台 published → accepted（mock 直接成功）
      case MockClaimBehavior.networkFailure:
        throw ClaimException('网络错误：无法连接后台，请稍后重试');
      case MockClaimBehavior.invalidState:
        throw ClaimException('任务状态已变化，无法认领（可能已被认领或已关闭）');
    }
  }
}
