import { Text, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FileDetailsScreen } from '../screens/FileDetailsScreen';
import { FilesScreen } from '../screens/FilesScreen';
import { FoldersScreen } from '../screens/FoldersScreen';
import { DashboardScreen } from '../screens/HomeScreen';
import { LoadingScreen } from '../screens/LoadingScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { UsersScreen } from '../screens/UsersScreen';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../theme/colors';

export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  FileDetails: { fileId: number };
};

export type MainTabParamList = {
  Dashboard: undefined;
  Files: undefined;
  Folders: undefined;
  Users: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.surface,
    text: colors.ink,
    border: colors.borderSoft,
    primary: colors.primary,
  },
};

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Home: '⌂',
    Files: '▤',
    Folders: '▣',
    Users: '☺',
    Profile: '●',
  };

  return (
    <View style={{ alignItems: 'center', gap: 2 }}>
      <Text style={{ color: focused ? colors.accent : colors.inkSoft, fontSize: 16, fontWeight: '700' }}>
        {icons[label] || '•'}
      </Text>
      <Text style={{ color: focused ? colors.ink : colors.inkSoft, fontSize: 11, fontWeight: '700' }}>{label}</Text>
    </View>
  );
}

function MainTabs() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.ink,
        headerTitleStyle: { fontWeight: '700', letterSpacing: -0.2 },
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.borderSoft,
          height: 68,
          paddingBottom: 10,
          paddingTop: 10,
        },
      }}
    >
      {isAdmin ? (
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ focused }) => <TabIcon focused={focused} label="Home" />,
          }}
        />
      ) : null}
      <Tab.Screen
        name="Files"
        component={FilesScreen}
        options={{
          title: 'Files',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} label="Files" />,
        }}
      />
      <Tab.Screen
        name="Folders"
        component={FoldersScreen}
        options={{
          title: 'Folders',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} label="Folders" />,
        }}
      />
      {isAdmin ? (
        <Tab.Screen
          name="Users"
          component={UsersScreen}
          options={{
            title: 'Users',
            tabBarIcon: ({ focused }) => <TabIcon focused={focused} label="Users" />,
          }}
        />
      ) : null}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} label="Profile" />,
        }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { isHydrating, user } = useAuth();

  if (isHydrating) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.ink,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen name="FileDetails" component={FileDetailsScreen} options={{ title: 'File Details' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
