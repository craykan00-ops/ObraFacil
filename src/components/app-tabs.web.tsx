import { Tabs, TabList, TabTrigger, TabSlot } from 'expo-router/ui';
import React from 'react';
import { View } from 'react-native';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <View style={{ height: 0, overflow: 'hidden' }}>
          <TabTrigger name="home" href="/" />
          <TabTrigger name="explore" href="/explore" />
        </View>
      </TabList>
    </Tabs>
  );
}
