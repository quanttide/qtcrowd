import 'package:flutter_test/flutter_test.dart';
import 'package:qtcrowd_studio/models/my_claim.dart';

void main() {
  group('MyClaim', () {
    test('fromJson / toJson 往返一致', () {
      const json = {
        'task_name': 'second-brain-init',
        'task_title': '第二大脑创建插件',
        'claimed_at': '2026-08-25T10:00:00.000Z',
      };
      final claim = MyClaim.fromJson(json);
      expect(claim.taskName, 'second-brain-init');
      expect(claim.taskTitle, '第二大脑创建插件');
      expect(claim.claimedAt, '2026-08-25T10:00:00.000Z');
      expect(claim.toJson(), json);
    });

    test('缺失字段兜底为空字符串', () {
      final claim = MyClaim.fromJson(const {});
      expect(claim.taskName, isEmpty);
      expect(claim.taskTitle, isEmpty);
      expect(claim.claimedAt, isEmpty);
    });
  });
}
