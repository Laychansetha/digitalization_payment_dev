import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:signature/signature.dart';
import 'package:uuid/uuid.dart';
import '../../config/theme.dart';
import '../../database/app_database.dart';
import '../../database/config_dao.dart';
import '../../models/purchase_record.dart';
import '../../models/specs_record.dart';

class PurchaseFormScreen extends StatefulWidget {
  const PurchaseFormScreen({Key? key}) : super(key: key);

  @override
  State<PurchaseFormScreen> createState() => _PurchaseFormScreenState();
}

class _PurchaseFormScreenState extends State<PurchaseFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _familyCodeController = TextEditingController();
  final _farmerNameController = TextEditingController();
  final _sackWeightsInputController = TextEditingController();
  final _seedBorrowedController = TextEditingController();
  final _premiumAmountController = TextEditingController(); // Represents KHR/KG
  final _searchController = TextEditingController();

  final FocusNode _familyCodeFocusNode = FocusNode();

  String? _editingId;
  String? _village;
  String? _variety;
  String? _grade;
  double _standardPrice = 1750.0;
  List<double> _sackWeights = [];
  String _searchQuery = '';
  SpecsRecord? _selectedLoadedSpecs;

  final SignatureController _sigController = SignatureController(
    penStrokeWidth: 3,
    penColor: Colors.white,
    exportBackgroundColor: Colors.transparent,
  );

  List<PurchaseRecord> _localHistory = [];

  @override
  void initState() {
    super.initState();
    _loadHistory();
    ConfigDao.instance.fetchRemoteConfig();
  }

  @override
  void dispose() {
    _familyCodeFocusNode.dispose();
    _searchController.dispose();
    _sigController.dispose();
    _premiumAmountController.dispose();
    super.dispose();
  }

  Future<void> _loadHistory() async {
    final list = await AppDatabase.instance.getAllPurchases();
    setState(() {
      _localHistory = list;
    });
  }

  void _resetForm() {
    _familyCodeController.clear();
    _farmerNameController.clear();
    _sackWeightsInputController.clear();
    _seedBorrowedController.clear();
    _premiumAmountController.clear();
    _sigController.clear();
    setState(() {
      _editingId = null;
      _village = null;
      _variety = null;
      _grade = null;
      _selectedLoadedSpecs = null;
      _sackWeights = [];
      _standardPrice = 1750.0;
    });
    _familyCodeFocusNode.requestFocus();
  }

  Future<void> _searchAndLoadSpecs() async {
    final queryCode = _familyCodeController.text.trim().toLowerCase();
    final queryName = _farmerNameController.text.trim().toLowerCase();
    final currentVillage = _village?.toLowerCase();

    if (queryCode.isEmpty && queryName.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a Family Code or Farmer Name to search Quality Specs / Farmer Info.'), backgroundColor: AppTheme.amberGold),
      );
      return;
    }

    final allSpecs = await AppDatabase.instance.getAllSpecs();
    final matches = allSpecs.where((s) {
      final codeMatch = queryCode.isNotEmpty && s.familyCode.toLowerCase() == queryCode;
      final nameMatch = queryName.isNotEmpty && s.farmerName.toLowerCase().contains(queryName);
      final villageMatch = currentVillage == null || currentVillage.isEmpty || s.village.toLowerCase() == currentVillage;
      return (codeMatch || nameMatch) && villageMatch;
    }).toList();

    if (matches.isNotEmpty) {
      if (matches.length == 1) {
        _applySelectedSpecs(matches.first);
      } else {
        _showSpecsSelectionDialog(matches);
      }
      return;
    }

    final farmers = await AppDatabase.instance.getAllFarmers();
    final matchingFarmers = farmers.where((f) {
      final codeMatch = queryCode.isNotEmpty && f.familyCode.toLowerCase() == queryCode;
      final nameMatch = queryName.isNotEmpty && f.farmerName.toLowerCase().contains(queryName);
      final villageMatch = currentVillage == null || currentVillage.isEmpty || f.village.toLowerCase() == currentVillage;
      return (codeMatch || nameMatch) && villageMatch;
    }).toList();

    if (matchingFarmers.isNotEmpty) {
      final f = matchingFarmers.first;
      setState(() {
        _familyCodeController.text = f.familyCode;
        _farmerNameController.text = f.farmerName;
        _village = f.village;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('⚡ Auto-loaded Farmer Info (${f.familyCode} · ${f.farmerName} in ${f.village})'),
          backgroundColor: AppTheme.emeraldPrimary,
        ),
      );
      return;
    }

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No Quality Specs or Farmer Profile found for Family Code + Village combination.'), backgroundColor: AppTheme.skyBlue),
      );
    }
  }

  void _applySelectedSpecs(SpecsRecord specs) {
    setState(() {
      _selectedLoadedSpecs = specs;
      _familyCodeController.text = specs.familyCode;
      _farmerNameController.text = specs.farmerName;
      _village = specs.village;
      _variety = specs.paddyType;
      _grade = specs.selectedGrade;
      _standardPrice = specs.finalPrice;
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('⚡ Auto-loaded Specs: ${specs.familyCode} (${specs.paddyType} ${specs.selectedGrade} · Base: ${specs.finalPrice.toInt()} KHR/kg)'),
        backgroundColor: AppTheme.emeraldPrimary,
      ),
    );
  }

  void _showSpecsSelectionDialog(List<SpecsRecord> matches) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppTheme.cardBackground,
        title: Row(
          children: const [
            Icon(Icons.inventory_2, color: AppTheme.amberGold, size: 20),
            SizedBox(width: 8),
            Text('Select Quality Specs Record', style: TextStyle(color: AppTheme.textWhite, fontSize: 16, fontWeight: FontWeight.bold)),
          ],
        ),
        content: SizedBox(
          width: double.maxFinite,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Multiple inspection records found. Please choose the correct record (matching Family Code & Village):', style: TextStyle(fontSize: 11, color: AppTheme.textMuted)),
              const SizedBox(height: 12),
              Flexible(
                child: ListView.builder(
                  shrinkWrap: true,
                  itemCount: matches.length,
                  itemBuilder: (context, index) {
                    final item = matches[index];
                    final dateStr = DateFormat('yyyy-MM-dd HH:mm').format(item.createdAt);
                    return Card(
                      color: AppTheme.inputBackground,
                      margin: const EdgeInsets.only(bottom: 8),
                      child: ListTile(
                        onTap: () {
                          Navigator.pop(ctx);
                          _applySelectedSpecs(item);
                        },
                        title: Text('${item.familyCode} · ${item.farmerName} (${item.village})', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.emeraldLight)),
                        subtitle: Text('Date: $dateStr\n${item.paddyType} (${item.selectedGrade}) · Base Price: ${item.finalPrice.toInt()} KHR/kg\nMoisture: ${item.moisture}% · Foreign: ${item.foreignMatter}% · Whole: ${item.wholeGrain}%', style: const TextStyle(fontSize: 10, color: AppTheme.textMuted)),
                        trailing: const Icon(Icons.arrow_forward_ios, size: 14, color: AppTheme.amberGold),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel', style: TextStyle(color: AppTheme.textMuted))),
        ],
      ),
    );
  }

  void _parseSackWeights(String text) {
    final parts = text.replaceAll(',', ' ').split(' ');
    final parsed = <double>[];
    for (var p in parts) {
      final clean = p.trim();
      if (clean.isNotEmpty) {
        final val = double.tryParse(clean);
        if (val != null && val > 0) {
          parsed.add(val);
        }
      }
    }
    setState(() {
      _sackWeights = parsed;
    });
  }

  Future<void> _savePurchase() async {
    if (!_formKey.currentState!.validate()) return;

    if (_village == null || _variety == null || _grade == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select Village, Paddy Category, and Grade.'), backgroundColor: AppTheme.errorRed),
      );
      return;
    }

    if (_sackWeights.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter individual sack weights (e.g. 100 102 98.5)'), backgroundColor: AppTheme.errorRed),
      );
      return;
    }

    final addPremiumPerKg = double.tryParse(_premiumAmountController.text) ?? 0.0;
    final finalPricePerKg = _standardPrice + addPremiumPerKg;
    final totalWeight = _sackWeights.reduce((a, b) => a + b);
    final grossValue = totalWeight * finalPricePerKg;
    final seedBorrowedKg = double.tryParse(_seedBorrowedController.text) ?? 0.0;
    final returnedSeedKg = seedBorrowedKg * ConfigDao.instance.seedInterestRate; // Configurable interest rate
    final seedDeduction = returnedSeedKg * finalPricePerKg;
    final netPayment = (grossValue - seedDeduction).clamp(0.0, double.infinity);

    Uint8List? sigBytes;
    if (_sigController.isNotEmpty) {
      sigBytes = await _sigController.toPngBytes();
    }

    final record = PurchaseRecord(
      id: _editingId ?? 'offline_${DateTime.now().millisecondsSinceEpoch}_${const Uuid().v4().substring(0, 4)}',
      familyCode: _familyCodeController.text.trim(),
      farmerName: _farmerNameController.text.trim(),
      village: _village!,
      variety: _variety!,
      grade: _grade!,
      standardPrice: _standardPrice,
      additionalPrice: 0.0,
      finalPrice: finalPricePerKg,
      sackWeights: _sackWeights,
      totalWeight: totalWeight,
      totalPayment: grossValue,
      seedBorrowed: seedBorrowedKg,
      seedRepayment: returnedSeedKg,
      seedDeduction: seedDeduction,
      premiumDescription: addPremiumPerKg > 0 ? 'Additional Premium (KHR/kg)' : null,
      additionalPremium: addPremiumPerKg,
      netPayment: netPayment,
      signatureFarmer: sigBytes != null ? 'data:image/png;base64,${sigBytes.toString()}' : null,
      createdAt: DateTime.now(),
      isSynced: false,
    );

    await AppDatabase.instance.insertPurchase(record);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(_editingId != null ? '✅ Purchase Record updated!' : '✅ Purchase Record saved locally! Form cleared for next farmer.'),
          backgroundColor: AppTheme.emeraldPrimary,
          duration: const Duration(seconds: 2),
        ),
      );
    }

    _resetForm();
    await _loadHistory();
  }

  void _editRecord(PurchaseRecord item) {
    if (item.isSynced) {
      _showAlertDialog('Locked Record', 'This purchase record has already been synchronized with the central PostgreSQL server and cannot be edited locally.');
      return;
    }

    setState(() {
      _editingId = item.id;
      _familyCodeController.text = item.familyCode;
      _farmerNameController.text = item.farmerName;
      _village = item.village;
      _variety = item.variety;
      _grade = item.grade;
      _standardPrice = item.standardPrice;
      _sackWeightsInputController.text = item.sackWeights.join(' ');
      _sackWeights = List.from(item.sackWeights);
      _seedBorrowedController.text = item.seedBorrowed == 0 ? '' : item.seedBorrowed.toString();
      _premiumAmountController.text = item.additionalPremium == 0 ? '' : item.additionalPremium.toString();
    });

    _familyCodeFocusNode.requestFocus();
  }

  Future<void> _deleteRecord(PurchaseRecord item) async {
    if (item.isSynced) {
      _showAlertDialog('Locked Record', 'Synchronized purchase records cannot be deleted locally.');
      return;
    }

    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppTheme.cardBackground,
        title: const Text('Delete Purchase Record', style: TextStyle(color: AppTheme.textWhite)),
        content: Text('Are you sure you want to delete purchase record for ${item.familyCode} (${item.farmerName}) in ${item.village}?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel', style: TextStyle(color: AppTheme.textMuted))),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.errorRed),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Delete', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );

    if (confirm == true) {
      await AppDatabase.instance.deletePurchase(item.id);
      await _loadHistory();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Purchase record deleted.')));
      }
    }
  }

  void _showRecordOptionsDialog(PurchaseRecord item) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppTheme.cardBackground,
        title: Text('${item.familyCode} · ${item.farmerName}', style: const TextStyle(color: AppTheme.amberGold, fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Village: ${item.village}', style: const TextStyle(color: AppTheme.textWhite, fontSize: 12)),
            Text('Variety: ${item.variety} (${item.grade})', style: const TextStyle(color: AppTheme.textWhite, fontSize: 12)),
            Text('Final Unit Price: ${item.finalPrice.toInt()} KHR/kg', style: const TextStyle(color: AppTheme.textWhite, fontSize: 12)),
            Text('Total Weight: ${item.totalWeight} kg (${item.sackWeights.length} Bags)', style: const TextStyle(color: AppTheme.textWhite, fontSize: 12)),
            Text('Gross Value: ${item.totalPayment.toInt()} KHR', style: const TextStyle(color: AppTheme.textWhite, fontSize: 12)),
            if (item.seedDeduction > 0)
              Text('Seed Deduction (${item.seedRepayment.toStringAsFixed(1)} kg): -${item.seedDeduction.toInt()} KHR', style: const TextStyle(color: AppTheme.errorRed, fontSize: 12)),
            Text('Net Payment: ${item.netPayment.toInt()} KHR', style: const TextStyle(color: AppTheme.emeraldLight, fontSize: 13, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text('Status: ${item.isSynced ? '🟢 Synced with Server' : '⏳ Pending Local Sync'}', style: TextStyle(color: item.isSynced ? AppTheme.emeraldLight : AppTheme.amberGold, fontSize: 11, fontWeight: FontWeight.bold)),
          ],
        ),
        actions: [
          if (!item.isSynced)
            TextButton.icon(
              onPressed: () {
                Navigator.pop(ctx);
                _editRecord(item);
              },
              icon: const Icon(Icons.edit, size: 16, color: AppTheme.skyBlue),
              label: const Text('Edit', style: TextStyle(color: AppTheme.skyBlue)),
            ),
          if (!item.isSynced)
            TextButton.icon(
              onPressed: () {
                Navigator.pop(ctx);
                _deleteRecord(item);
              },
              icon: const Icon(Icons.delete, size: 16, color: AppTheme.errorRed),
              label: const Text('Delete', style: TextStyle(color: AppTheme.errorRed)),
            ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.emeraldPrimary),
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Close', style: TextStyle(color: Color(0xFF0B0F19), fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  void _showAlertDialog(String title, String message) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppTheme.cardBackground,
        title: Text(title, style: const TextStyle(color: AppTheme.amberGold, fontWeight: FontWeight.bold)),
        content: Text(message, style: const TextStyle(color: AppTheme.textWhite)),
        actions: [ElevatedButton(onPressed: () => Navigator.pop(ctx), child: const Text('OK'))],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final addPremiumPerKg = double.tryParse(_premiumAmountController.text) ?? 0.0;
    final finalPricePerKg = _standardPrice + addPremiumPerKg;
    final totalWeight = _sackWeights.isEmpty ? 0.0 : _sackWeights.fold(0.0, (a, b) => a + b);
    final grossValue = totalWeight * finalPricePerKg;
    final seedBorrowedKg = double.tryParse(_seedBorrowedController.text) ?? 0.0;
    final returnedSeedKg = seedBorrowedKg * ConfigDao.instance.seedInterestRate; // Dynamic interest rate
    final seedDeduction = returnedSeedKg * finalPricePerKg;
    final netPayment = (grossValue - seedDeduction).clamp(0.0, double.infinity);

    final filteredHistory = _localHistory.where((item) {
      if (_searchQuery.isEmpty) return true;
      final q = _searchQuery.toLowerCase();
      return item.familyCode.toLowerCase().contains(q) ||
          item.farmerName.toLowerCase().contains(q) ||
          item.village.toLowerCase().contains(q);
    }).toList();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppTheme.cardBackground,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.borderLight),
                boxShadow: const [
                  BoxShadow(color: Colors.black26, blurRadius: 10, offset: Offset(0, 4)),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.scale, color: AppTheme.amberGold, size: 20),
                          const SizedBox(width: 8),
                          Text(
                            _editingId != null ? 'Edit Paddy Purchase Record' : 'Paddy Purchase Invoice & Weighing',
                            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textWhite),
                          ),
                        ],
                      ),
                      Row(
                        children: [
                          ElevatedButton.icon(
                            onPressed: _searchAndLoadSpecs,
                            icon: const Icon(Icons.flash_on, size: 14, color: Color(0xFF0B0F19)),
                            label: const Text('Load Quality Specs', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppTheme.amberGold,
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                            ),
                          ),
                          if (_editingId != null) ...[
                            const SizedBox(width: 8),
                            TextButton.icon(
                              onPressed: _resetForm,
                              icon: const Icon(Icons.cancel, size: 14, color: AppTheme.amberGold),
                              label: const Text('Cancel Edit', style: TextStyle(fontSize: 11, color: AppTheme.amberGold)),
                            ),
                          ],
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  if (_selectedLoadedSpecs != null)
                    Container(
                      margin: const EdgeInsets.only(bottom: 16),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppTheme.emeraldPrimary.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppTheme.emeraldPrimary.withOpacity(0.4)),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.check_circle, color: AppTheme.emeraldLight, size: 18),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              'Linked Quality Specs: ${_selectedLoadedSpecs!.paddyType} (${_selectedLoadedSpecs!.selectedGrade}) · Moisture: ${_selectedLoadedSpecs!.moisture}% · Base Price: ${_selectedLoadedSpecs!.finalPrice.toInt()} KHR/kg',
                              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.emeraldLight),
                            ),
                          ),
                        ],
                      ),
                    ),

                  // Row 1: Family Code, Farmer Name, Village
                  LayoutBuilder(
                    builder: (context, constraints) {
                      bool isDesktop = constraints.maxWidth > 600;
                      return isDesktop
                          ? Row(
                              children: [
                                Expanded(child: _buildFamilyCodeInput()),
                                const SizedBox(width: 12),
                                Expanded(child: _buildFarmerNameInput()),
                                const SizedBox(width: 12),
                                Expanded(child: _buildVillageDropdown()),
                              ],
                            )
                          : Column(
                              children: [
                                _buildFamilyCodeInput(),
                                const SizedBox(height: 12),
                                _buildFarmerNameInput(),
                                const SizedBox(height: 12),
                                _buildVillageDropdown(),
                              ],
                            );
                    },
                  ),
                  const SizedBox(height: 16),

                  // Row 2: Paddy Variety, Grade
                  LayoutBuilder(
                    builder: (context, constraints) {
                      bool isDesktop = constraints.maxWidth > 600;
                      return isDesktop
                          ? Row(
                              children: [
                                Expanded(child: _buildPaddyCategoryDropdown()),
                                const SizedBox(width: 12),
                                Expanded(child: _buildGradeDropdown()),
                              ],
                            )
                          : Column(
                              children: [
                                _buildPaddyCategoryDropdown(),
                                const SizedBox(height: 12),
                                _buildGradeDropdown(),
                              ],
                            );
                    },
                  ),
                  const SizedBox(height: 16),

                  // Row 3: Sack Weights Array Input
                  TextFormField(
                    controller: _sackWeightsInputController,
                    decoration: const InputDecoration(labelText: 'INDIVIDUAL SACK WEIGHTS (KG) *', hintText: 'e.g. 100 102 98.5 101.5'),
                    onChanged: _parseSackWeights,
                    validator: (v) => _sackWeights.isEmpty ? 'Enter sack weights separated by spaces' : null,
                  ),
                  const SizedBox(height: 12),

                  // Weighing Summary Banner
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppTheme.inputBackground,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Sacks Count: ${_sackWeights.length} Bags', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.skyBlue)),
                        Text('Total Weight: ${totalWeight.toStringAsFixed(1)} kg', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: AppTheme.emeraldLight)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Row 4: Seed Borrowed (Kg) + Additional Premium (KHR/KG) Inputs Side-by-Side
                  LayoutBuilder(
                    builder: (context, constraints) {
                      bool isDesktop = constraints.maxWidth > 600;
                      return isDesktop
                          ? Row(
                              children: [
                                Expanded(
                                  child: TextFormField(
                                    controller: _seedBorrowedController,
                                    keyboardType: TextInputType.number,
                                    decoration: const InputDecoration(labelText: 'SEED BORROWED (KG)', hintText: '0'),
                                    onChanged: (v) => setState(() {}),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: TextFormField(
                                    controller: _premiumAmountController,
                                    keyboardType: TextInputType.number,
                                    decoration: const InputDecoration(labelText: 'ADDITIONAL PREMIUM (KHR/KG)', hintText: '0'),
                                    onChanged: (v) => setState(() {}),
                                  ),
                                ),
                              ],
                            )
                          : Column(
                              children: [
                                TextFormField(
                                  controller: _seedBorrowedController,
                                  keyboardType: TextInputType.number,
                                  decoration: const InputDecoration(labelText: 'SEED BORROWED (KG)', hintText: '0'),
                                  onChanged: (v) => setState(() {}),
                                ),
                                const SizedBox(height: 12),
                                TextFormField(
                                  controller: _premiumAmountController,
                                  keyboardType: TextInputType.number,
                                  decoration: const InputDecoration(labelText: 'ADDITIONAL PREMIUM (KHR/KG)', hintText: '0'),
                                  onChanged: (v) => setState(() {}),
                                ),
                              ],
                            );
                    },
                  ),
                  const SizedBox(height: 16),

                  // Net Payment Calculation Card
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppTheme.emeraldPrimary.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppTheme.emeraldPrimary.withOpacity(0.4)),
                    ),
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Base Price: ${_standardPrice.toInt()} KHR/kg' + (addPremiumPerKg > 0 ? ' + ${addPremiumPerKg.toInt()} Premium' : ''),
                              style: const TextStyle(fontSize: 12, color: AppTheme.textMuted),
                            ),
                            Text('Final Price: ${finalPricePerKg.toInt()} KHR/kg', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.skyBlue)),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Gross Value (${totalWeight.toStringAsFixed(1)} kg × ${finalPricePerKg.toInt()} KHR):', style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                            Text('${grossValue.toInt()} KHR', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.textWhite)),
                          ],
                        ),
                        if (seedBorrowedKg > 0) ...[
                          const SizedBox(height: 6),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Seed Return Deduction (${returnedSeedKg.toStringAsFixed(1)} kg × ${finalPricePerKg.toInt()} KHR):',
                                style: const TextStyle(fontSize: 12, color: AppTheme.errorRed),
                              ),
                              Text('-${seedDeduction.toInt()} KHR', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.errorRed)),
                            ],
                          ),
                        ],
                        const Divider(color: Colors.white24, height: 16),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('NET PAYMENT TO FARMER:', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: AppTheme.emeraldLight)),
                            Text('${netPayment.toInt()} KHR', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppTheme.emeraldLight)),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Electronic Touch Signature Pad
                  const Text('✍️ Farmer Electronic Touch Signature', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.textMuted)),
                  const SizedBox(height: 6),
                  Container(
                    height: 100,
                    decoration: BoxDecoration(
                      color: AppTheme.inputBackground,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.white24),
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Signature(controller: _sigController, backgroundColor: AppTheme.inputBackground),
                    ),
                  ),
                  Align(
                    alignment: Alignment.centerRight,
                    child: TextButton(
                      onPressed: () => _sigController.clear(),
                      child: const Text('Clear Signature', style: TextStyle(fontSize: 11, color: AppTheme.amberGold)),
                    ),
                  ),
                  const SizedBox(height: 16),

                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _savePurchase,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: _editingId != null ? AppTheme.emeraldPrimary : AppTheme.amberGold,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: Text(
                        _editingId != null ? 'Update Purchase Record' : 'Save Purchase Record',
                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF0B0F19)),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // History Header & Search Box
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Saved Purchase Receipts', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.textWhite)),
                Text('${filteredHistory.length} Receipts', style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
              ],
            ),
            const SizedBox(height: 10),

            // Search Box
            TextFormField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Search by Family Code, Farmer Name, or Village...',
                prefixIcon: const Icon(Icons.search, color: AppTheme.textMuted, size: 18),
                suffixIcon: _searchQuery.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear, size: 16, color: AppTheme.textMuted),
                        onPressed: () {
                          _searchController.clear();
                          setState(() => _searchQuery = '');
                        },
                      )
                    : null,
              ),
              onChanged: (val) => setState(() => _searchQuery = val.trim()),
            ),
            const SizedBox(height: 12),

            filteredHistory.isEmpty
                ? Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(color: AppTheme.cardBackground, borderRadius: BorderRadius.circular(12)),
                    child: const Center(
                      child: Text('No matching purchase records found.', style: TextStyle(color: AppTheme.textMuted, fontSize: 12)),
                    ),
                  )
                : ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: filteredHistory.length,
                    itemBuilder: (context, index) {
                      final item = filteredHistory[index];
                      return Card(
                        color: AppTheme.cardBackground,
                        margin: const EdgeInsets.only(bottom: 8),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                          side: const BorderSide(color: AppTheme.borderLight),
                        ),
                        child: ListTile(
                          onTap: () => _showRecordOptionsDialog(item),
                          title: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('${item.familyCode} · ${item.farmerName}', style: const TextStyle(fontWeight: FontWeight.w900, color: AppTheme.amberGold)),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: item.isSynced ? AppTheme.emeraldPrimary.withOpacity(0.2) : AppTheme.amberGold.withOpacity(0.2),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Text(
                                  item.isSynced ? '✓ Synced' : '⏳ Offline',
                                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: item.isSynced ? AppTheme.emeraldLight : AppTheme.amberGold),
                                ),
                              ),
                            ],
                          ),
                          subtitle: Text('${item.village} · ${item.totalWeight} kg\nNet: ${item.netPayment.toInt()} KHR', style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                          trailing: Icon(
                            item.isSynced ? Icons.lock_outline : Icons.chevron_right,
                            color: item.isSynced ? AppTheme.textMuted : AppTheme.amberGold,
                            size: 18,
                          ),
                        ),
                      );
                    },
                  ),
          ],
        ),
      ),
    );
  }

  Widget _buildFamilyCodeInput() {
    return TextFormField(
      controller: _familyCodeController,
      focusNode: _familyCodeFocusNode,
      decoration: InputDecoration(
        labelText: 'FAMILY CODE *',
        hintText: 'e.g. TB034',
        suffixIcon: IconButton(
          icon: const Icon(Icons.search, color: AppTheme.amberGold, size: 20),
          tooltip: 'Search Quality Specs / Farmer Info',
          onPressed: _searchAndLoadSpecs,
        ),
      ),
      validator: (v) => v == null || v.isEmpty ? 'Required' : null,
    );
  }

  Widget _buildFarmerNameInput() {
    return TextFormField(
      controller: _farmerNameController,
      decoration: InputDecoration(
        labelText: 'FARMER NAME *',
        hintText: 'e.g. Sok San',
        suffixIcon: IconButton(
          icon: const Icon(Icons.search, color: AppTheme.amberGold, size: 20),
          tooltip: 'Search Quality Specs / Farmer Info',
          onPressed: _searchAndLoadSpecs,
        ),
      ),
      validator: (v) => v == null || v.isEmpty ? 'Required' : null,
    );
  }

  Widget _buildVillageDropdown() {
    final villageList = ConfigDao.instance.villages;
    return DropdownButtonFormField<String>(
      value: _village,
      decoration: const InputDecoration(labelText: 'VILLAGE *', hintText: 'Select Village'),
      items: villageList
          .map((v) => DropdownMenuItem(value: v, child: Text(v, style: const TextStyle(fontSize: 12))))
          .toList(),
      validator: (v) => v == null ? 'Select Village' : null,
      onChanged: (val) => setState(() => _village = val),
    );
  }

  Widget _buildPaddyCategoryDropdown() {
    final categories = ConfigDao.instance.paddyCategories;
    return DropdownButtonFormField<String>(
      value: _variety,
      decoration: const InputDecoration(labelText: 'PADDY CATEGORY *', hintText: 'Select Category'),
      items: categories
          .map((v) => DropdownMenuItem(value: v, child: Text(v, style: const TextStyle(fontSize: 12))))
          .toList(),
      validator: (v) => v == null ? 'Select Category' : null,
      onChanged: (val) {
        setState(() {
          _variety = val;
          if (val != null) {
            _standardPrice = ConfigDao.instance.getBasePrice(val);
          }
        });
      },
    );
  }

  Widget _buildGradeDropdown() {
    final gradeList = ConfigDao.instance.grades;
    return DropdownButtonFormField<String>(
      value: _grade,
      decoration: const InputDecoration(labelText: 'GRADE *', hintText: 'Select Grade'),
      items: gradeList
          .map((g) => DropdownMenuItem(value: g, child: Text(g, style: const TextStyle(fontSize: 12))))
          .toList(),
      validator: (v) => v == null ? 'Select Grade' : null,
      onChanged: (val) => setState(() => _grade = val),
    );
  }
}
