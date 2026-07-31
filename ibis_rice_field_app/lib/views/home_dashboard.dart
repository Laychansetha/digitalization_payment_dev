import 'package:flutter/material.dart';
import '../config/theme.dart';
import '../database/app_database.dart';
import '../services/sync_service.dart';
import 'specs/specs_form_screen.dart';
import 'farmers/farmer_form_screen.dart';
import 'purchases/purchase_form_screen.dart';
import 'transport/transport_form_screen.dart';

class HomeDashboard extends StatefulWidget {
  const HomeDashboard({Key? key}) : super(key: key);

  @override
  State<HomeDashboard> createState() => _HomeDashboardState();
}

class _HomeDashboardState extends State<HomeDashboard> {
  int _currentIndex = 0;
  int _unsyncedCount = 0;
  bool _isSyncing = false;
  String _syncStatusMessage = '';

  @override
  void initState() {
    super.initState();
    _loadUnsyncedCount();
  }

  Future<void> _loadUnsyncedCount() async {
    final count = await AppDatabase.instance.getUnsyncedCount();
    setState(() {
      _unsyncedCount = count;
    });
  }

  Future<void> _triggerSync() async {
    setState(() {
      _isSyncing = true;
      _syncStatusMessage = 'Connecting to central PostgreSQL server...';
    });

    final syncService = SyncService();
    final result = await syncService.syncAllOfflineRecords(
      onProgress: (status) {
        setState(() {
          _syncStatusMessage = status;
        });
      },
    );

    setState(() {
      _isSyncing = false;
      _syncStatusMessage = result.message;
    });

    await _loadUnsyncedCount();

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result.message),
          backgroundColor: result.syncedCount > 0 ? AppTheme.emeraldPrimary : AppTheme.cardBackground,
        ),
      );
    }
  }

  final List<Widget> _tabs = [
    const SpecsFormScreen(),
    const FarmerFormScreen(),
    const PurchaseFormScreen(),
    const TransportFormScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: const [
            Icon(Icons.grass, color: AppTheme.emeraldPrimary, size: 24),
            SizedBox(width: 8),
            Text(
              'IBIS RICE FIELD OPERATIONS',
              style: TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: AppTheme.textWhite),
            ),
          ],
        ),
        actions: [
          // Sync Drawer / Button
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: InkWell(
              onTap: _isSyncing ? null : _triggerSync,
              borderRadius: BorderRadius.circular(20),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: _unsyncedCount > 0 ? AppTheme.amberGold.withOpacity(0.2) : Colors.white10,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: _unsyncedCount > 0 ? AppTheme.amberGold : Colors.white24,
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _isSyncing
                        ? const SizedBox(
                            width: 12,
                            height: 12,
                            child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.skyBlue),
                          )
                        : Icon(
                            Icons.cloud_sync,
                            size: 16,
                            color: _unsyncedCount > 0 ? AppTheme.amberGold : AppTheme.emeraldLight,
                          ),
                    const SizedBox(width: 6),
                    Text(
                      _unsyncedCount > 0 ? '$_unsyncedCount Pending' : 'Synced',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: _unsyncedCount > 0 ? AppTheme.amberGold : AppTheme.emeraldLight,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          if (_syncStatusMessage.isNotEmpty)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              color: AppTheme.skyBlue.withOpacity(0.15),
              child: Row(
                children: [
                  const Icon(Icons.info_outline, size: 14, color: AppTheme.skyBlue),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      _syncStatusMessage,
                      style: const TextStyle(fontSize: 11, color: AppTheme.skyBlue, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
            ),
          Expanded(child: _tabs[_currentIndex]),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        backgroundColor: AppTheme.cardBackground,
        selectedItemColor: AppTheme.emeraldPrimary,
        unselectedItemColor: AppTheme.textMuted,
        type: BottomNavigationBarType.fixed,
        selectedFontSize: 11,
        unselectedFontSize: 11,
        items: const [
          BottomNavigationBarViewItem(icon: Icon(Icons.analytics_outlined), label: 'Specs'),
          BottomNavigationBarViewItem(icon: Icon(Icons.account_balance_wallet_outlined), label: 'Farmers'),
          BottomNavigationBarViewItem(icon: Icon(Icons.scale_outlined), label: 'Purchases'),
          BottomNavigationBarViewItem(icon: Icon(Icons.local_shipping_outlined), label: 'Transport'),
        ],
      ),
    );
  }
}

class BottomNavigationBarViewItem extends BottomNavigationBarItem {
  const BottomNavigationBarViewItem({required Widget icon, required String label})
      : super(icon: icon, label: label);
}
