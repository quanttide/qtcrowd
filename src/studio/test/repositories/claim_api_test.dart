import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:qtcrowd_studio/repositories/claim_api.dart';

void main() {
  group('MockClaimApi（本地 mock：PROVIDER_URL/BACKEND_API 均未配置时）', () {
    test('默认成功：published → accepted', () async {
      final api = MockClaimApi();
      await api.claim(taskId: 't1', partnerId: 'local-dev');
      // 不抛错即成功
    });

    test('networkFailure → ClaimException（网络失败不写本地）', () async {
      final api = MockClaimApi(MockClaimBehavior.networkFailure);
      expect(
        () => api.claim(taskId: 't1', partnerId: 'p1'),
        throwsA(isA<ClaimException>().having(
          (e) => e.message,
          'message',
          contains('网络错误'),
        )),
      );
    });

    test('invalidState → ClaimException（非法状态：已认领 / 已关闭）', () async {
      final api = MockClaimApi(MockClaimBehavior.invalidState);
      expect(
        () => api.claim(taskId: 't1', partnerId: 'p1'),
        throwsA(isA<ClaimException>().having(
          (e) => e.message,
          'message',
          contains('任务状态已变化'),
        )),
      );
    });
  });

  group('HttpClaimApi（POST {PROVIDER_URL}/api/tasks/{id}/claim，经 qtcrowd-provider 转发）', () {
    test('2xx → 认领成功（请求路径与 body 正确）', () async {
      late http.Request captured;
      final client = MockClient((request) async {
        captured = request;
        return http.Response('{"status":"accepted"}', 200);
      });
      final api = HttpClaimApi('https://api.example.com', client: client);

      await api.claim(taskId: 't1', partnerId: 'p1');

      expect(captured.method, 'POST');
      expect(captured.url.toString(),
          'https://api.example.com/api/tasks/t1/claim');
      expect(captured.body, '{"partner_id":"p1"}');
      expect(captured.headers['Content-Type'], contains('application/json'));
    });

    test('409（非法状态：非 published）→ ClaimException 且提示可读', () async {
      final client = MockClient(
        (request) async => http.Response('{"error":"task not published"}', 409),
      );
      final api = HttpClaimApi('https://api.example.com', client: client);

      expect(
        () => api.claim(taskId: 't1', partnerId: 'p1'),
        throwsA(isA<ClaimException>().having(
          (e) => e.message,
          'message',
          contains('任务状态已变化'),
        )),
      );
    });

    test('404（任务不存在 / 已下架）→ ClaimException', () async {
      final client = MockClient(
        (request) async => http.Response('{"error":"not found"}', 404),
      );
      final api = HttpClaimApi('https://api.example.com', client: client);

      expect(
        () => api.claim(taskId: 'missing', partnerId: 'p1'),
        throwsA(isA<ClaimException>().having(
          (e) => e.message,
          'message',
          contains('任务不存在或已下架'),
        )),
      );
    });

    test('网络异常 → ClaimException（不抛裸异常）', () async {
      final client = MockClient(
        (request) async => throw http.ClientException('connection refused'),
      );
      final api = HttpClaimApi('https://api.example.com', client: client);

      expect(
        () => api.claim(taskId: 't1', partnerId: 'p1'),
        throwsA(isA<ClaimException>().having(
          (e) => e.message,
          'message',
          contains('网络错误'),
        )),
      );
    });

    test('partnerId 未配置（空）→ ClaimException 提示配置', () async {
      final client = MockClient((request) async => http.Response('{}', 200));
      final api = HttpClaimApi('https://api.example.com', client: client);

      expect(
        () => api.claim(taskId: 't1', partnerId: ''),
        throwsA(isA<ClaimException>().having(
          (e) => e.message,
          'message',
          contains('QTCLOUD_CROWD_PARTNER_ID'),
        )),
      );
    });
  });
}
