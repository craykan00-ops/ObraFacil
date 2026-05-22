import { Tabs, TabSlot } from 'expo-router/ui';
import React from 'react';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
    </Tabs>
  );
}
