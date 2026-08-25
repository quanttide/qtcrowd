import 'package:flutter/material.dart';

import '../models/my_claim.dart';
import '../models/task.dart';
import '../repositories/my_task_repository.dart';
import 'task_list_screen.dart' show TaskStatusChip;

/// 我的认领：本地认领记录列表（任务名 + 认领时间，展示为进行中）。
class MyTasksScreen extends StatefulWidget {
  const MyTasksScreen({super.key, required this.repository});

  final MyTaskRepository repository;

  @override
  State<MyTasksScreen> createState() => _MyTasksScreenState();
}

class _MyTasksScreenState extends State<MyTasksScreen> {
  List<MyClaim> _claims = [];
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final claims = await widget.repository.findAll();
      if (!mounted) return;
      setState(() {
        _claims = claims;
        _error = null;
      });
    } catch (e) {
      setState(() => _error = '加载认领记录失败：$e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('我的认领')),
      body: _error != null
          ? Center(child: Text(_error!))
          : _claims.isEmpty
              ? const Center(child: Text('还没有认领任务，去「任务」页看看吧'))
              : ListView.builder(
                  itemCount: _claims.length,
                  itemBuilder: (context, index) {
                    final claim = _claims[index];
                    return Card(
                      margin: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      child: ListTile(
                        leading: const Icon(Icons.handshake_outlined),
                        title: Text(claim.taskTitle),
                        subtitle: Text('认领于 ${_formatDate(claim.claimedAt)}'),
                        trailing: const TaskStatusChip(
                          status: TaskStatus.inProgress,
                        ),
                      ),
                    );
                  },
                ),
    );
  }

  static String _formatDate(String iso) {
    final parts = iso.split('T');
    return parts.isEmpty ? iso : parts.first;
  }
}
