/// App Config for IBIS RICE Field Operations Mobile App
class AppConfig {
  /// Default Server Base URL (Change to IP address of your desktop test machine or Lightsail server)
  /// Note: Use 10.0.2.2 for Android Emulator connecting to Desktop localhost, or 192.168.x.x for real devices.
  static String baseUrl = 'http://localhost:3000';

  // API Route Paths
  static const String specsEndpoint = '/api/specs';
  static const String farmersEndpoint = '/api/farmers';
  static const String purchasesEndpoint = '/api/purchases';
  static const String transportEndpoint = '/api/transport';
  static const String uploadEndpoint = '/api/upload';
  static const String priceSpecsEndpoint = '/api/admin/price-specs';
  static const String villagesEndpoint = '/api/admin/villages';
  static const String banksEndpoint = '/api/admin/banks';

  // Sync Settings
  static const int syncTimeoutSeconds = 15;
}
