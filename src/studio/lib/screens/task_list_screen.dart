import 'package:flutter/material.dart';

import '../models/task.dart';
import '../repositories/claim_api.dart';
import '../repositories/my_task_repository.dart';
import '../repositories/task_repository.dart';
import 'task_detail_screen.dart';

/// 状态标签（可认领 / 进行中 / 已关闭，参与端视角）。
class TaskStatusChip extends StatelessWidget {
  const TaskStatusChip({super.key, required this.status});

  final TaskStatus status;

  @override
  Widget build(BuildContext context) {
    final (label, color) = switch (status) {
      TaskStatus.pending => ('可认领', Colors.orange),
      TaskStatus.inProgress => ('进行中', Colors.blue),
      TaskStatus.closed => ('已关闭', Colors.grey),
    };
    return Chip(
      label: Text(label),
      labelStyle: TextStyle(fontSize: 12, color: color),
      backgroundColor: color.withValues(alpha: 0.12),
      visualDensity: VisualDensity.compact,
      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
    );
  }
}

/// 任务列表（参与端入口）：展示 title / category / business / 状态 / 报酬。
///
/// 任务来自 qtcrowd-provider 数据 API（published 任务）：PROVIDER_URL 配置时读数据 API，
/// 未配置时回退打包 assets tasks.json（开发兜底）。未认领状态显示「可认领」；
/// 已被我认领的任务展示为进行中（本地认领记录）。
class TaskListScreen extends StatefulWidget {
  const TaskListScreen({
    super.key,
    required this.repository,
    required this.myTasks,
    required this.claimApi,
  });

  final TaskRepository repository;
  final MyTaskRepository myTasks;
  final ClaimApi claimApi;

  @override
  State<TaskListScreen> createState() => _TaskListScreenState();
}

class _TaskListScreenState extends State<TaskListScreen> {
  List<Task> _tasks = [];
  Set<String> _claimedNames = const {};
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final tasks = await widget.repository.findAll();
      final claims = await widget.myTasks.findAll();
      if (!mounted) return;
      setState(() {
        _tasks = tasks;
        _claimedNames = {for (final c in claims) c.taskName};
        _error = null;
      });
    } catch (e) {
      setState(() => _error = '加载任务失败：$e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('任务')),
      body: _error != null
          ? Center(child: Text(_error!))
          : ListView.builder(
              itemCount: _tasks.length,
              itemBuilder: (context, index) {
                final task = _tasks[index];
                final claimed = _claimedNames.contains(task.name);
                return _TaskCard(
                  task: task,
                  claimed: claimed,
                  onTap: () => Navigator.of(context).push(
                    MaterialPageRoute<void>(
                      builder: (_) => TaskDetailScreen(
                        task: task,
                        myTasks: widget.myTasks,
                        claimApi: widget.claimApi,
                      ),
                    ),
                  ),
                );
              },
            ),
    );
  }
}

class _TaskCard extends StatelessWidget {
  const _TaskCard({required this.task, required this.claimed, this.onTap});

  final Task task;
  final bool claimed;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      task.title,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                  ),
                  TaskStatusChip(
                    status: task.effectiveStatus(claimed: claimed),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                task.description,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(color: Colors.black54),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 4,
                children: [
                  _MetaChip(icon: Icons.business, text: task.business),
                  _MetaChip(icon: Icons.label_outline, text: task.category),
                ],
              ),
              if (task.rewardSummary != null) ...[
                const SizedBox(height: 8),
                Text(
                  '报酬：${task.rewardSummary}',
                  style: const TextStyle(fontWeight: FontWeight.w500),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _MetaChip extends StatelessWidget {
  const _MetaChip({required this.icon, required this.text});

  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: Colors.black45),
        const SizedBox(width: 2),
        Text(text, style: const TextStyle(color: Colors.black54, fontSize: 12)),
      ],
    );
  }
}
