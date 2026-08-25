/// 任务模型（参与端任务目录）。
///
/// 结构对齐 site 的 tasks.json 契约（tasks.schema.json）：
/// 档案字段 + 站点侧字段（name/description/applyGuide）全量建模。
/// 数据真实源：父仓库 data/profile，经 site 同步后的同一份 tasks.json
/// （见 AGENTS.md）——studio 只读展示，不自创占位数据。
library;

import 'dart:convert';

/// 任务状态（黄页可接性依据，与 site 的 TaskStatus 一致）。
enum TaskStatus {
  /// 待认领（可接）
  pending('待认领'),

  /// 进行中（已在进行，暂不可接）
  inProgress('进行中'),

  /// 已关闭（不可接）
  closed('已关闭');

  const TaskStatus(this.label);

  /// 中文标签（与 tasks.json 中的 status 值一致）。
  final String label;

  static TaskStatus fromJson(String? value) {
    return TaskStatus.values.firstWhere(
      (s) => s.label == value,
      orElse: () => TaskStatus.pending,
    );
  }
}

/// 参考链接（reference 列表项）。
class TaskReference {
  const TaskReference({required this.label, this.url});

  final String label;
  final String? url;

  factory TaskReference.fromJson(Map<String, dynamic> json) {
    return TaskReference(
      label: json['label'] as String? ?? '',
      url: json['url'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'label': label,
      'url': url,
    };
  }
}

/// 众包任务（与 tasks.schema.json 中 task 定义保持一致）。
class Task {
  const Task({
    required this.name,
    required this.title,
    required this.description,
    required this.business,
    required this.category,
    required this.status,
    required this.background,
    required this.content,
    required this.input,
    required this.reference,
    required this.deliverables,
    required this.reward,
    required this.others,
    required this.applyGuide,
  });

  /// 唯一任务标识（与档案文件名一致）。
  final String name;

  /// 任务名。
  final String title;

  /// 目录一句话。
  final String description;

  /// 业务。
  final String business;

  /// 类别。
  final String category;

  /// 状态（黄页可接性依据）。
  final TaskStatus status;

  /// 任务背景。
  final List<String> background;

  /// 任务内容。
  final List<String> content;

  /// 任务输入。
  final List<String> input;

  /// 参考链接。
  final List<TaskReference> reference;

  /// 交付物。
  final List<String> deliverables;

  /// 报酬 / 结算。
  final List<String> reward;

  /// 其他说明。
  final List<String> others;

  /// 如何报名步骤。
  final List<String> applyGuide;

  /// 是否可认领（参与端视角：待认领状态才可接）。
  bool get claimable => status == TaskStatus.pending;

  /// 展示状态：已被我认领的任务，即使档案状态为待认领，参与端视为进行中。
  TaskStatus effectiveStatus({required bool claimed}) {
    if (claimed && status == TaskStatus.pending) return TaskStatus.inProgress;
    return status;
  }

  /// 报酬首条（列表卡片展示用）。
  String? get rewardSummary => reward.isEmpty ? null : reward.first;

  factory Task.fromJson(Map<String, dynamic> json) {
    List<String> strings(String key) =>
        (json[key] as List?)?.whereType<String>().toList() ?? const [];
    List<TaskReference> references(String key) =>
        (json[key] as List?)?.whereType<Map<String, dynamic>>().map(TaskReference.fromJson).toList() ?? const [];

    return Task(
      name: json['name'] as String? ?? '',
      title: json['title'] as String? ?? '',
      description: json['description'] as String? ?? '',
      business: json['business'] as String? ?? '',
      category: json['category'] as String? ?? '',
      status: TaskStatus.fromJson(json['status'] as String?),
      background: strings('background'),
      content: strings('content'),
      input: strings('input'),
      reference: references('reference'),
      deliverables: strings('deliverables'),
      reward: strings('reward'),
      others: strings('others'),
      applyGuide: strings('applyGuide'),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'title': title,
      'description': description,
      'business': business,
      'category': category,
      'status': status.label,
      'background': background,
      'content': content,
      'input': input,
      'reference': reference.map((r) => r.toJson()).toList(),
      'deliverables': deliverables,
      'reward': reward,
      'others': others,
      'applyGuide': applyGuide,
    };
  }
}

/// 任务目录解析（从 tasks.json 原始内容解析任务列表）。
List<Task> parseTaskCatalog(String raw) {
  final decoded = (jsonDecode(raw) as Map<String, dynamic>)['tasks'];
  if (decoded is! List) return const [];
  return decoded.whereType<Map<String, dynamic>>().map(Task.fromJson).toList();
}
