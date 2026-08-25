/// 我的认领模型（参与端本地记录）。
///
/// 认领 = 在本地记一条"我认领了这个任务"（data/my-tasks.json），
/// 参与端不写管理端数据——任务档案状态仍以 tasks.json 为准，
/// 展示时用 [Task.effectiveStatus] 把已认领的待认领任务视为进行中。
library;

/// 我的认领记录。
class MyClaim {
  const MyClaim({
    required this.taskName,
    required this.taskTitle,
    required this.claimedAt,
  });

  /// 任务标识（与 Task.name 一致，同任务只认领一次）。
  final String taskName;

  /// 任务名（认领时冗余存一份，避免列表页依赖任务目录）。
  final String taskTitle;

  /// 认领时间（ISO 8601）。
  final String claimedAt;

  factory MyClaim.fromJson(Map<String, dynamic> json) {
    return MyClaim(
      taskName: json['task_name'] as String? ?? '',
      taskTitle: json['task_title'] as String? ?? '',
      claimedAt: json['claimed_at'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'task_name': taskName,
      'task_title': taskTitle,
      'claimed_at': claimedAt,
    };
  }
}
