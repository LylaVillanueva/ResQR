import AdminHomeScreen from '../screens/official/HomeScreen';
import AdminResidentScreen from '../screens/official/ResidentScreen';
import AdminAlertScreen from '../screens/official/AlertScreen';
import AdminSettingsScreen from '../screens/official/SettingsScreen';
import AdminScannerScreen from '../screens/shared/ScannerScreen';
import AdminEnrollNewResident from '../screens/official/EnrollNewResident';
import AdminEditResidentInfo from '../screens/official/EditResidentInfo';
import AdminProfileScreen from '../screens/official/ProfileScreen';
import AdminAuditLogScreen from '../screens/official/AuditLogScreen';
import AdminAlertDetails from '../screens/official/AlertDetails';
import AdminAssignResponder from '../screens/official/AssignResponder';
import AdminManageUsers from '../screens/official/ManageUsers';
import AdminAddUser from '../screens/official/AddUser';
import AdminUserDetails from '../screens/official/UserDetails';
import GuardianHomeScreen from '../screens/guardian/HomeScreen';
import GuardianResidentScreen from '../screens/guardian/ResidentScreen';
import GuardianAlertScreen from '../screens/guardian/AlertScreen';
import GuardianSettingsScreen from '../screens/guardian/SettingsScreen';
import GuardianScannerScreen from '../screens/shared/ScannerScreen';
import GuardianProfileScreen from '../screens/guardian/ProfileScreen';
import GuardianAuditLogScreen from '../screens/guardian/AuditLogScreen';
import GuardianConfirmationScreen from '../screens/guardian/ConfirmationScreen';
import GuardianAlertDetails from '../screens/guardian/AlertDetails';
import GuardianEmergencyHelpScreen from '../screens/guardian/EmergencyHelpScreen';
import ResponderHomeScreen from '../screens/responder/HomeScreen';
import ResponderResidentScreen from '../screens/responder/ResidentScreen';
import ResponderAlertScreen from '../screens/responder/AlertScreen';
import ResponderSettingsScreen from '../screens/responder/SettingsScreen';
import ResponderScannerScreen from '../screens/shared/ScannerScreen';
import ResponderProfileScreen from '../screens/responder/ProfileScreen';
import ResponderAuditLogScreen from '../screens/responder/AuditLogScreen';
import ResponderConfirmationScreen from '../screens/responder/ConfirmationScreen';
import ResponderAlertDetails from '../screens/responder/AlertDetails';
import ResponderIncidentScreen from '../screens/responder/IncidentScreen';
import ResponderIncidentReportScreen from '../screens/responder/IncidentReportScreen';
import LegalScreen from "../screens/shared/LegalScreen";
import AccessibilityOptionsScreen from "../screens/shared/AccessibilityOptionsScreen";

export const roleScreens = {
  barangay_official: {
  Home: AdminHomeScreen,
  ResidentScreen: AdminResidentScreen,
  AlertScreen: AdminAlertScreen,
  SettingsScreen: AdminSettingsScreen,
  ScannerScreen: AdminScannerScreen,
  EnrollNewResident: AdminEnrollNewResident,
  EditResidentInfo: AdminEditResidentInfo,
  ProfileScreen: AdminProfileScreen,
  AuditLogScreen: AdminAuditLogScreen,
  AlertDetails: AdminAlertDetails,
  AssignResponder: AdminAssignResponder,
  ManageUsers: AdminManageUsers,
  AddUser: AdminAddUser,
  UserDetails: AdminUserDetails,
  Legal: LegalScreen,
  AccessibilityOptions: AccessibilityOptionsScreen,
  },
  guardian: {
  Home: GuardianHomeScreen,
  ResidentScreen: GuardianResidentScreen,
  AlertScreen: GuardianAlertScreen,
  SettingsScreen: GuardianSettingsScreen,
  ScannerScreen: GuardianScannerScreen,
  ProfileScreen: GuardianProfileScreen,
  AuditLogScreen: GuardianAuditLogScreen,
  ConfirmationScreen: GuardianConfirmationScreen,
  AlertDetails: GuardianAlertDetails,
  EmergencyHelp: GuardianEmergencyHelpScreen,
  Legal: LegalScreen,
  AccessibilityOptions: AccessibilityOptionsScreen,
  },
  barangay_responder: {
  Home: ResponderHomeScreen,
  ResidentScreen: ResponderResidentScreen,
  AlertScreen: ResponderAlertScreen,
  SettingsScreen: ResponderSettingsScreen,
  ScannerScreen: ResponderScannerScreen,
  ProfileScreen: ResponderProfileScreen,
  AuditLogScreen: ResponderAuditLogScreen,
  ConfirmationScreen: ResponderConfirmationScreen,
  AlertDetails: ResponderAlertDetails,
  IncidentScreen: ResponderIncidentScreen,
  IncidentReportScreen: ResponderIncidentReportScreen,
  Legal: LegalScreen,
  AccessibilityOptions: AccessibilityOptionsScreen,
  },
};
