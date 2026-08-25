import 'package:flutter_test/flutter_test.dart';
import 'package:qtcrowd_studio/models/settlement.dart';

void main() {
  group('Settlement', () {
    test('fromJson / toJson 往返一致', () {
      const json = {
        'id': 's_1',
        'task_name': 'second-brain-init',
        'amount': 100.5,
        'settled_at': '2026-08-25T10:00:00.000Z',
      };
      final settlement = Settlement.fromJson(json);
      expect(settlement.id, 's_1');
      expect(settlement.taskName, 'second-brain-init');
      expect(settlement.amount, 100.5);
      expect(settlement.settledAt, '2026-08-25T10:00:00.000Z');
      expect(settlement.toJson(), json);
    });

    test('缺失字段兜底（amount 兜底 0）', () {
      final settlement = Settlement.fromJson(const {'id': 's_2'});
      expect(settlement.taskName, isEmpty);
      expect(settlement.amount, 0);
    });
  });
}
