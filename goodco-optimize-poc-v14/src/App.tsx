import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from './store/appStore';
import { IntroScreen } from './components/IntroScreen';
import { PipelineShell } from './components/PipelineShell';
import { WrapScreen } from './components/WrapScreen';
import { pipeline } from './data/pipeline';

function App() {
  const screen = useApp((s) => s.screen);

  return (
    <div className="w-full min-h-screen bg-stage">
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full"
        >
          {screen === 'intro' && <IntroScreen pipeline={pipeline} />}
          {screen === 'pipeline' && <PipelineShell pipeline={pipeline} />}
          {screen === 'wrap' && <WrapScreen pipeline={pipeline} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default App;
