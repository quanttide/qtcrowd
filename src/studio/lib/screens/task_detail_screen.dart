import 'package:flutter/material.dart';

import '../models/my_claim.dart';
import '../models/task.dart';
import '../repositories/my_task_repository.dart';
import 'task_list_screen.dart' show TaskStatusChip;

/// 任务详情：背景 / 内容 / 输入 / 参考 / 交付物 / 报酬 / 其他 / 如何报名。
///
/// 认领：待认领任务 → 认领按钮 → 本地记一条认领（data/my-tasks.json），
/// 状态展示为进行中。参与端不写管理端数据，任务档案状态不变。
class TaskDetailScreen extends StatefulWidget {
  const TaskDetailScreen({
    super.key,
    required this.task,
    required this.myTasks,
  });

  final Task task;
  final MyTaskRepository myTasks;

  @override
  State<TaskDetailScreen> createState() => _TaskDetailScreenState();
}

class _TaskDetailScreenState extends State<TaskDetailScreen> {
  MyClaim? _claim;
  bool _saving = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final claim = await widget.myTasks.findByTaskName(widget.task.name);
      if (!mounted) return;
      setState(() {
        _claim = claim;
        _error = null;
      });
    } catch (e) {
      setState(() => _error = '加载认领状态失败：$e');
    }
  }

  /// 认领：待认领任务 → 本地记录我的认领 → 展示为进行中。
  Future<void> _claimTask() async {
    if (_saving) return;
    setState(() => _saving = true);
    try {
      final claim = MyClaim(
        taskName: widget.task.name,
        taskTitle: widget.task.title,
        claimedAt: DateTime.now().toIso8601String(),
      );
      await widget.myTasks.save(claim);
      if (!mounted) return;
      setState(() {
        _claim = claim;
        _error = null;
      });
    } catch (e) {
      setState(() => _error = '认领失败：$e');
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  /// 当前展示状态：被本地认领的待认领任务视为进行中。
  TaskStatus get _status =>
      widget.task.effectiveStatus(claimed: _claim != null);

  @override
  Widget build(BuildContext context) {
    final task = widget.task;
    return Scaffold(
      appBar: AppBar(title: Text(task.title)),
      body: ListView(
        padding: const EdgeInsets.all(12),
        children: [
          _Header(task: task, status: _status),
          const SizedBox(height: 8),
          _buildClaimAction(),
          if (_error != null)
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Text(_error!, style: const TextStyle(color: Colors.red)),
            ),
          _Section(title: '任务背景', items: task.background),
          _Section(title: '任务内容', items: task.content),
          _Section(title: '任务输入', items: task.input),
          if (task.reference.isNotEmpty) _ReferenceSection(task: task),
          _Section(title: '交付物', items: task.deliverables),
          _Section(title: '报酬 / 结算', items: task.reward),
          if (task.others.isNotEmpty) _Section(title: '其他说明', items: task.others),
          _Section(title: '如何报名', items: task.applyGuide),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildClaimAction() {
    switch (_status) {
      case TaskStatus.pending:
        return FilledButton.icon(
          onPressed: _saving ? null : _claimTask,
          icon: const Icon(Icons.handshake_outlined),
          label: Text(_saving ? '认领中…' : '认领任务'),
        );
      case TaskStatus.inProgress:
        return FilledButton.tonalIcon(
          onPressed: null,
          icon: const Icon(Icons.verified_outlined),
          label: const Text('已认领 · 进行中'),
        );
      case TaskStatus.closed:
        return FilledButton.tonalIcon(
          onPressed: null,
          icon: const Icon(Icons.lock_outline),
          label: const Text('已关闭 · 不可认领'),
        );
    }
  }
}

class _Header extends StatelessWidget {
  const _Header({required this.task, required this.status});

  final Task task;
  final TaskStatus status;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                task.title,
                style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
            ),
            TaskStatusChip(status: status),
          ],
        ),
        const SizedBox(height: 4),
        Text(
          '${task.business} · ${task.category}',
          style: const TextStyle(color: Colors.black54),
        ),
      ],
    );
  }
}

/// 结构化段落（背景 / 内容 / 输入 / 交付物 / 报酬 / 报名等）。
class _Section extends StatelessWidget {
  const _Section({required this.title, required this.items});

  final String title;
  final List<String> items;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          for (final item in items) Text('· $item'),
        ],
      ),
    );
  }
}

/// 参考链接段落。
class _ReferenceSection extends StatelessWidget {
  const _ReferenceSection({required this.task});

  final Task task;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('参考链接', style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          for (final r in task.reference)
            r.url == null
                ? Text('· ${r.label}')
                : InkWell(
                    onTap: () {},
                    child: Text(
                      '· ${r.label}',
                      style: const TextStyle(color: Colors.blue),
                    ),
                  ),
        ],
      ),
    );
  }
}
