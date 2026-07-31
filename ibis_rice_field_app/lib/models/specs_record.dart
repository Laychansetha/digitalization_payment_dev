import 'dart:convert';

class SpecsRecord {
  final String id;
  final String? serverRecordId;
  final String familyCode;
  final String farmerName;
  final String village;
  final String paddyType;
  final String selectedGrade;
  final bool isOrganic;
  final double moisture;
  final double foreignMatter;
  final double wholeGrain;
  final double brokenRice;
  final bool isValid;
  final double basePrice;
  final double organicBonus;
  final double finalPrice;
  final DateTime createdAt;
  final bool isSynced;
  final String? syncError;

  SpecsRecord({
    required this.id,
    this.serverRecordId,
    required this.familyCode,
    required this.farmerName,
    required this.village,
    required this.paddyType,
    required this.selectedGrade,
    required this.isOrganic,
    required this.moisture,
    required this.foreignMatter,
    required this.wholeGrain,
    required this.brokenRice,
    required this.isValid,
    required this.basePrice,
    required this.organicBonus,
    required this.finalPrice,
    required this.createdAt,
    this.isSynced = false,
    this.syncError,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'serverRecordId': serverRecordId,
      'familyCode': familyCode,
      'farmerName': farmerName,
      'village': village,
      'paddyType': paddyType,
      'selectedGrade': selectedGrade,
      'isOrganic': isOrganic ? 1 : 0,
      'moisture': moisture,
      'foreignMatter': foreignMatter,
      'wholeGrain': wholeGrain,
      'brokenRice': brokenRice,
      'isValid': isValid ? 1 : 0,
      'basePrice': basePrice,
      'organicBonus': organicBonus,
      'finalPrice': finalPrice,
      'createdAt': createdAt.toIso8601String(),
      'isSynced': isSynced ? 1 : 0,
      'syncError': syncError,
    };
  }

  factory SpecsRecord.fromMap(Map<String, dynamic> map) {
    return SpecsRecord(
      id: map['id'],
      serverRecordId: map['serverRecordId'],
      familyCode: map['familyCode'],
      farmerName: map['farmerName'],
      village: map['village'],
      paddyType: map['paddyType'],
      selectedGrade: map['selectedGrade'],
      isOrganic: map['isOrganic'] == 1 || map['isOrganic'] == true,
      moisture: (map['moisture'] as num).toDouble(),
      foreignMatter: (map['foreignMatter'] as num).toDouble(),
      wholeGrain: (map['wholeGrain'] as num?)?.toDouble() ?? 0.0,
      brokenRice: (map['brokenRice'] as num?)?.toDouble() ?? 0.0,
      isValid: map['isValid'] == 1 || map['isValid'] == true,
      basePrice: (map['basePrice'] as num).toDouble(),
      organicBonus: (map['organicBonus'] as num).toDouble(),
      finalPrice: (map['finalPrice'] as num).toDouble(),
      createdAt: DateTime.parse(map['createdAt']),
      isSynced: map['isSynced'] == 1 || map['isSynced'] == true,
      syncError: map['syncError'],
    );
  }

  Map<String, dynamic> toPostJson() {
    return {
      'familyCode': familyCode,
      'farmerName': farmerName,
      'village': village,
      'paddyType': paddyType,
      'selectedGrade': selectedGrade,
      'isOrganic': isOrganic,
      'moisture': moisture,
      'foreignMatter': foreignMatter,
      'wholeGrain': wholeGrain,
      'brokenRice': brokenRice,
      'isValid': isValid,
      'basePrice': basePrice,
      'organicBonus': organicBonus,
      'finalPrice': finalPrice,
    };
  }
}
