import React, { useState, useEffect, useRef } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Dumbbell, 
  Brain, 
  Target, 
  TrendingUp, 
  Users, 
  LogOut, 
  Calendar, 
  Trophy, 
  Play, 
  RotateCcw,
  User
} from 'lucide-react';

// --- Firebase Imports ---
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  signInAnonymously
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  getDoc
} from "firebase/firestore";

// --- Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyDP7-Ietl5arW6T-DaS8Bo6KrKM27sYTLQ",
  authDomain: "bluejays-wrestling.firebaseapp.com",
  databaseURL: "https://bluejays-wrestling-default-rtdb.firebaseio.com",
  projectId: "bluejays-wrestling",
  storageBucket: "bluejays-wrestling.firebasestorage.app",
  messagingSenderId: "23720620944",
  appId: "1:23720620944:web:2444e543fe6f8812f8f915",
  measurementId: "G-JFG8K0HQK5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Types ---
interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: 'athlete' | 'coach';
  weightClass?: string;
}

interface WeightLog {
  id: string;
  date: string;
  weight: number;
  notes: string;
}

interface FocusLog {
  id: string;
  date: string;
  score: number;
}

// --- Components ---

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false }: any) => {
  const base = "px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-blue-700 hover:bg-blue-800 text-white shadow-md",
    secondary: "bg-white text-blue-800 border-2 border-blue-700 hover:bg-blue-50",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100"
  };
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${base} ${variants[variant as keyof typeof variants]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className = '' }: any) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 ${className}`}>
    {children}
  </div>
);

// --- Focus Grid Game ---
const FocusGrid = ({ onComplete }: { onComplete: (score: number) => void }) => {
  const [grid, setGrid] = useState<number[]>([]);
  const [nextNum, setNextNum] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [gameOver, setGameOver] = useState(false);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    initializeGrid();
    return () => stopGame();
  }, []);

  useEffect(() => {
    if (timeLeft === 0) endGame();
  }, [timeLeft]);

  const initializeGrid = () => {
    const numbers = Array.from({ length: 100 }, (_, i) => i);
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    setGrid(numbers);
    setNextNum(0);
    setGameOver(false);
    setTimeLeft(120);
  };

  const startGame = () => {
    setIsPlaying(true);
    setGameOver(false);
    setNextNum(0);
    setTimeLeft(120);
    timerRef.current = setInterval(() => setTimeLeft((p) => p - 1), 1000);
  };

  const stopGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsPlaying(false);
  };

  const endGame = () => {
    stopGame();
    setGameOver(true);
    onComplete(nextNum);
  };

  const handleCellClick = (num: number) => {
    if (!isPlaying) return;
    if (num === nextNum) {
      setNextNum(prev => prev + 1);
      if (num === 99) endGame();
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto">
      <div className="flex justify-between w-full mb-4 items-center bg-blue-50 p-3 rounded-lg">
        <div className="text-xl font-bold text-blue-900">Find: {nextNum}</div>
        <div className={`text-xl font-bold font-mono ${timeLeft < 10 ? 'text-red-600' : 'text-gray-700'}`}>
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>
      </div>

      {!isPlaying && !gameOver && (
        <div className="text-center py-10">
          <Brain className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Focus Grid Challenge</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Find numbers 00-99 in order. 2 minutes on the clock.
          </p>
          <Button onClick={startGame} className="mx-auto w-full md:w-auto">
            <Play size={20} /> Start Drill
          </Button>
        </div>
      )}

      {gameOver && (
        <div className="text-center py-10 animate-fade-in">
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Drill Complete!</h3>
          <p className="text-gray-600 mb-6 text-lg">
            You reached number <span className="font-bold text-blue-700 text-xl">{nextNum}</span>
          </p>
          <Button onClick={initializeGrid} variant="secondary" className="mx-auto">
            <RotateCcw size={20} /> Try Again
          </Button>
        </div>
      )}

      {isPlaying && (
        <div className="grid grid-cols-10 gap-1 w-full aspect-square select-none">
          {grid.map((num) => (
            <div
              key={num}
              onClick={() => handleCellClick(num)}
              className={`
                aspect-square flex items-center justify-center text-[10px] sm:text-sm md:text-base font-bold rounded cursor-pointer transition-colors
                ${num < nextNum ? 'bg-blue-200 text-blue-400' : 'bg-white border border-gray-200 hover:bg-blue-50 text-gray-800'}
                ${num === nextNum ? 'ring-2 ring-blue-600 z-10 bg-blue-50' : ''}
              `}
            >
              {num.toString().padStart(2, '0')}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Main App ---
export default function App() {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Data
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [focusLogs, setFocusLogs] = useState<FocusLog[]>([]);
  const [allAthletes, setAllAthletes] = useState<any[]>([]);
  
  // Inputs
  const [weightInput, setWeightInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [coachPasscode, setCoachPasscode] = useState('');
  const [showCoachModal, setShowCoachModal] = useState(false);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchUserProfile(currentUser.uid, currentUser.email || '');
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Data Fetching
  useEffect(() => {
    if (!user || !userProfile) return;

    if (userProfile.role === 'athlete') {
      const unsubWeights = onSnapshot(
        query(collection(db, 'users', user.uid, 'weight_logs'), orderBy('date', 'desc')),
        (snap) => setWeightLogs(snap.docs.map(d => ({ id: d.id, ...d.data() } as WeightLog)))
      );
      const unsubFocus = onSnapshot(
        query(collection(db, 'users', user.uid, 'focus_logs'), orderBy('date', 'desc')),
        (snap) => setFocusLogs(snap.docs.map(d => ({ id: d.id, ...d.data() } as FocusLog)))
      );
      setLoading(false);
      return () => { unsubWeights(); unsubFocus(); };
    } else if (userProfile.role === 'coach') {
      // In a real app with proper index, we'd query 'users' collection.
      // For simplicity, we use a separate roster collection or assume we can read user profiles.
      // Note: Reading all users usually requires Admin SDK or specific Firestore structure.
      // We will use a dedicated 'roster' collection that users write to upon signup.
      const q = query(collection(db, 'roster'));
      const unsub = onSnapshot(q, (snap) => {
        setAllAthletes(snap.docs.map(d => d.data()));
        setLoading(false);
      });
      return unsub;
    }
  }, [user, userProfile]);

  const fetchUserProfile = async (uid: string, email: string) => {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      setUserProfile(docSnap.data() as UserProfile);
    } else {
      const newProfile: UserProfile = {
        uid,
        email,
        name: email ? email.split('@')[0] : 'Athlete',
        role: 'athlete'
      };
      await setDoc(docRef, newProfile);
      // Add to public roster
      await setDoc(doc(db, 'roster', uid), {
        uid,
        name: newProfile.name,
        email: newProfile.email,
        weightClass: 'Unassigned'
      });
      setUserProfile(newProfile);
    }
  };

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (e) {
      console.error(e);
      alert("Error logging in. Try again.");
    }
  };

  const handleWeightSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !weightInput) return;

    await addDoc(collection(db, 'users', user.uid, 'weight_logs'), {
      date: new Date().toISOString(),
      weight: parseFloat(weightInput),
      notes: noteInput
    });
    setWeightInput('');
    setNoteInput('');
  };

  const handleFocusComplete = async (score: number) => {
    if (!user) return;
    await addDoc(collection(db, 'users', user.uid, 'focus_logs'), {
      date: new Date().toISOString(),
      score: score,
      timestamp: serverTimestamp()
    });
  };

  const handleBecomeCoach = async () => {
    if (coachPasscode === 'bluejay') {
      if (user && userProfile) {
        const newProfile = { ...userProfile, role: 'coach' as const };
        await setDoc(doc(db, 'users', user.uid), newProfile);
        setUserProfile(newProfile);
        setShowCoachModal(false);
      }
    } else {
      alert("Incorrect passcode");
    }
  };

  const updateProfile = async (field: string, value: string) => {
    if (!user || !userProfile) return;
    const newProfile = { ...userProfile, [field]: value };
    await setDoc(doc(db, 'users', user.uid), newProfile);
    // Update roster entry
    await setDoc(doc(db, 'roster', user.uid), {
      uid: user.uid,
      name: newProfile.name,
      email: newProfile.email,
      weightClass: newProfile.weightClass || 'Unassigned'
    }, { merge: true });
    setUserProfile(newProfile);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-700"></div>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex flex-col items-center justify-center p-6 text-white">
        <div className="w-full max-w-md bg-white text-gray-900 rounded-2xl shadow-xl p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-blue-100 p-4 rounded-full mb-4">
              <TrendingUp size={48} className="text-blue-700" />
            </div>
            <h1 className="text-3xl font-extrabold text-blue-900">Merrill Bluejays</h1>
            <p className="text-gray-500 font-medium">Girls Wrestling Tracker</p>
          </div>
          
          <div className="space-y-4">
            <Button onClick={handleLogin} className="w-full justify-center text-lg h-12">
              <User size={20} /> Sign in with Google
            </Button>
            <Button onClick={() => signInAnonymously(auth)} variant="ghost" className="w-full text-xs">
              Guest Login (Testing Only)
            </Button>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Coach Access</span>
              </div>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => setShowCoachModal(true)}
              className="w-full justify-center text-sm"
            >
              I am a Coach
            </Button>
          </div>
        </div>
        
        {showCoachModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-sm text-gray-900">
              <h3 className="text-xl font-bold mb-4">Coach Verification</h3>
              <input 
                type="password" 
                placeholder="Team Passcode" 
                className="w-full border p-3 rounded-lg mb-4"
                value={coachPasscode}
                onChange={(e) => setCoachPasscode(e.target.value)}
              />
              <div className="flex gap-2">
                <Button onClick={() => setShowCoachModal(false)} variant="secondary" className="flex-1">Cancel</Button>
                <Button onClick={handleBecomeCoach} className="flex-1">Verify</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- Coach View ---
  if (userProfile?.role === 'coach') {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <header className="bg-blue-800 text-white p-4 shadow-md sticky top-0 z-50">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Users size={24} /> Coach Dashboard
            </h1>
            <Button variant="ghost" className="text-white hover:bg-blue-700" onClick={() => signOut(auth)}>
              Log Out
            </Button>
          </div>
        </header>
        <main className="max-w-6xl mx-auto p-4">
          <Card className="mb-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-gray-400" /> Team Roster ({allAthletes.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-gray-500 text-sm border-b border-gray-100">
                    <th className="py-3 px-2">Name</th>
                    <th className="py-3 px-2">Weight Class</th>
                    <th className="py-3 px-2">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {allAthletes.map((athlete) => (
                    <tr key={athlete.uid} className="border-b border-gray-50 hover:bg-blue-50">
                      <td className="py-3 px-2 font-medium">{athlete.name || 'Unknown'}</td>
                      <td className="py-3 px-2">
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">
                          {athlete.weightClass || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-500">{athlete.email}</td>
                    </tr>
                  ))}
                  {allAthletes.length === 0 && (
                    <tr><td colSpan={3} className="py-8 text-center text-gray-400">No athletes yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  // --- Athlete View ---
  return (
    <div className="pb-20">
      <div className="bg-blue-700 text-white p-6 rounded-b-3xl shadow-lg mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">Hi, {userProfile?.name?.split(' ')[0]}</h2>
            <p className="opacity-80 text-sm">Let's get better today.</p>
          </div>
          <Button variant="ghost" className="text-white hover:bg-blue-600 p-2" onClick={() => signOut(auth)}>
            <LogOut size={20} />
          </Button>
        </div>
        <div className="flex gap-4 mt-6 overflow-x-auto pb-2 no-scrollbar">
          <div className="bg-white/10 backdrop-blur p-3 rounded-xl min-w-[100px]">
            <div className="text-xs opacity-70 mb-1">Current Weight</div>
            <div className="text-xl font-bold">{weightLogs[0]?.weight || '--'} lbs</div>
          </div>
          <div className="bg-white/10 backdrop-blur p-3 rounded-xl min-w-[100px]">
            <div className="text-xs opacity-70 mb-1">Target Class</div>
            <div className="text-xl font-bold">{userProfile?.weightClass || '--'}</div>
          </div>
        </div>
      </div>

      <div className="px-4 max-w-4xl mx-auto space-y-6">
        {activeTab === 'dashboard' && (
          <>
            <Card>
              <h3 className="font-bold text-gray-800 mb-2">My Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500">Weight Class</label>
                  <select 
                    className="w-full mt-1 p-2 border rounded-lg bg-gray-50 text-sm"
                    value={userProfile?.weightClass || ''}
                    onChange={(e) => updateProfile('weightClass', e.target.value)}
                  >
                    <option value="">Select Class</option>
                    <option value="100">100 lbs</option>
                    <option value="107">107 lbs</option>
                    <option value="114">114 lbs</option>
                    <option value="120">120 lbs</option>
                    <option value="126">126 lbs</option>
                    <option value="132">132 lbs</option>
                    <option value="138">138 lbs</option>
                    <option value="145">145 lbs</option>
                    <option value="152">152 lbs</option>
                    <option value="165">165 lbs</option>
                    <option value="185">185 lbs</option>
                    <option value="235">235 lbs</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Name</label>
                  <input 
                    className="w-full mt-1 p-2 border rounded-lg bg-gray-50 text-sm"
                    value={userProfile?.name || ''}
                    onChange={(e) => updateProfile('name', e.target.value)}
                  />
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-r from-blue-50 to-white border-l-4 border-blue-600">
              <div className="flex items-start gap-3">
                <Brain className="text-blue-600 mt-1" size={24} />
                <div>
                  <h3 className="font-bold text-blue-900">Wrestling Mindset</h3>
                  <p className="text-sm text-gray-600 mt-1 italic">
                    "Hard work beats talent when talent doesn't work hard."
                  </p>
                </div>
              </div>
            </Card>

            <h3 className="font-bold text-gray-800 mt-4 ml-1">Recent Weight Logs</h3>
            <div className="space-y-3">
              {weightLogs.slice(0, 3).map(log => (
                <div key={log.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Dumbbell size={16} className="text-green-700" />
                    </div>
                    <div>
                      <div className="font-bold">{log.weight} lbs</div>
                      <div className="text-xs text-gray-500">{new Date(log.date).toLocaleDateString()}</div>
                    </div>
                  </div>
                  {log.notes && <div className="text-xs text-gray-400 max-w-[100px] truncate">{log.notes}</div>}
                </div>
              ))}
              {weightLogs.length === 0 && <div className="text-gray-400 text-sm py-2">No logs yet.</div>}
            </div>
          </>
        )}

        {activeTab === 'weight' && (
          <>
            <Card>
              <form onSubmit={handleWeightSubmit} className="space-y-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Dumbbell className="text-blue-600" size={20} /> Log Weight
                </h3>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 block mb-1">Weight (lbs)</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      value={weightInput}
                      onChange={(e) => setWeightInput(e.target.value)}
                      className="w-full p-3 border rounded-lg bg-gray-50 text-lg font-bold"
                      placeholder="0.0"
                      required
                    />
                  </div>
                  <div className="flex-[2]">
                    <label className="text-xs text-gray-500 block mb-1">Notes</label>
                    <input 
                      type="text" 
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      className="w-full p-3 border rounded-lg bg-gray-50"
                      placeholder="Hydration, etc."
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">Save Entry</Button>
              </form>
            </Card>
            {weightLogs.length > 1 && (
              <Card className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[...weightLogs].reverse()}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString(undefined, {month:'numeric', day:'numeric'})} />
                    <YAxis domain={['dataMin - 5', 'dataMax + 5']} hide />
                    <RechartsTooltip />
                    <Line type="monotone" dataKey="weight" stroke="#1d4ed8" strokeWidth={3} dot={{r: 4}} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            )}
          </>
        )}

        {activeTab === 'focus' && (
          <Card>
            <FocusGrid onComplete={handleFocusComplete} />
            <div className="mt-8">
              <h3 className="font-bold text-gray-800 mb-3">Your History</h3>
              <div className="space-y-2">
                {focusLogs.slice(0, 5).map(log => (
                  <div key={log.id} className="flex justify-between text-sm border-b border-gray-100 pb-2">
                    <span className="text-gray-500">{new Date(log.date).toLocaleDateString()}</span>
                    <span className="font-bold text-blue-700">Reached: {log.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-3 z-40">
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center ${activeTab === 'dashboard' ? 'text-blue-700' : 'text-gray-400'}`}>
          <TrendingUp size={24} />
          <span className="text-xs mt-1">Dash</span>
        </button>
        <button onClick={() => setActiveTab('weight')} className={`flex flex-col items-center ${activeTab === 'weight' ? 'text-blue-700' : 'text-gray-400'}`}>
          <Dumbbell size={24} />
          <span className="text-xs mt-1">Weight</span>
        </button>
        <button onClick={() => setActiveTab('focus')} className={`flex flex-col items-center ${activeTab === 'focus' ? 'text-blue-700' : 'text-gray-400'}`}>
          <Target size={24} />
          <span className="text-xs mt-1">Focus</span>
        </button>
      </div>
    </div>
  );
}
