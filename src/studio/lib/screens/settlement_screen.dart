import 'package:flutter/material.dart';

import '../models/settlement.dart';
import '../repositories/settlement_repository.dart';

/// 我的结算：参与端自己的结算记录（金额 / 时间），本地文件 data/my-settlements.json。
///
/// 按量潮标准结算（认领任务完成后的收款），只记自己的账，不写管理端数据。
class SettlementScreen extends StatefulWidget {
  const SettlementScreen({super.key, required this.repository});

  final SettlementRepository repository;

  @override
  State<SettlementScreen> createState() => _SettlementScreenState();
}

class _SettlementScreenState extends State<SettlementScreen> {
  List<Settlement> _settlements = [];
  String? _error;

  final _taskController = TextEditingController();
  final _amountController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _taskController.dispose();
    _amountController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    try {
      final settlements = await widget.repository.findAll();
      if (!mounted) return;
      setState(() {
        _settlements = settlements;
        _error = null;
      });
    } catch (e) {
      setState(() => _error = '加载结算记录失败：$e');
    }
  }

  /// 记一笔：任务名称必填，金额必须 > 0。
  Future<void> _addSettlement() async {
    final taskName = _taskController.text.trim();
    final amount = double.tryParse(_amountController.text.trim());
    if (taskName.isEmpty || amount == null || amount <= 0) {
      setState(() => _error = '请填写任务名称和大于 0 的金额');
      return;
    }
    final settlement = Settlement(
      id: 's_${DateTime.now().millisecondsSinceEpoch}',
      taskName: taskName,
      amount: amount,
      settledAt: DateTime.now().toIso8601String(),
    );
    await widget.repository.save(settlement);
    _taskController.clear();
    _amountController.clear();
    await _load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('我的结算')),
      body: ListView(
        padding: const EdgeInsets.all(12),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    '新增一笔（按量潮标准结算）',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _taskController,
                    decoration: const InputDecoration(
                      labelText: '任务名称',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _amountController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: '金额（元）',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Align(
                    alignment: Alignment.centerRight,
                    child: FilledButton.icon(
                      onPressed: _addSettlement,
                      icon: const Icon(Icons.add),
                      label: const Text('记一笔'),
                    ),
                  ),
                ],
              ),
            ),
          ),
          if (_error != null)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: Text(_error!, style: const TextStyle(color: Colors.red)),
            ),
          const Divider(),
          if (_settlements.isEmpty)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 24),
              child: Center(child: Text('还没有结算记录')),
            )
          else
            for (final s in _settlements)
              Card(
                margin: const EdgeInsets.symmetric(vertical: 4),
                child: ListTile(
                  leading: const Icon(Icons.payments),
                  title: Text('¥ ${s.amount.toStringAsFixed(2)}'),
                  subtitle: Text('任务 ${s.taskName}'),
                  trailing: Text(
                    s.settledAt.split('T').first,
                    style: const TextStyle(color: Colors.grey),
                  ),
                ),
              ),
        ],
      ),
    );
  }
}
