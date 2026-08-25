/// 我的结算模型（参与端本地记录）。
///
/// 结算 = 认领任务完成后的收款记录（金额 + 时间），
/// 只记参与端自己的账（data/my-settlements.json），不写管理端数据。
library;

/// 我的结算记录。
class Settlement {
  const Settlement({
    required this.id,
    required this.taskName,
    required this.amount,
    required this.settledAt,
  });

  final String id;

  /// 任务标识（认领的任务）。
  final String taskName;

  /// 结算金额（元）。
  final double amount;

  /// 结算时间（ISO 8601）。
  final String settledAt;

  factory Settlement.fromJson(Map<String, dynamic> json) {
    return Settlement(
      id: json['id'] as String? ?? '',
      taskName: json['task_name'] as String? ?? '',
      amount: (json['amount'] as num?)?.toDouble() ?? 0,
      settledAt: json['settled_at'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'task_name': taskName,
      'amount': amount,
      'settled_at': settledAt,
    };
  }
}
