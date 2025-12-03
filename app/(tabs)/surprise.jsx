import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function SurpriseRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/surprise-du-jour');
  }, []);
  
  return null;
}
