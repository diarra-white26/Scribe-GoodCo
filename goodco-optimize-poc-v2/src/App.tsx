import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from './store/appStore';
import { WindowChrome } from './components/WindowChrome';
import { IntroScreen } from './components/IntroScreen';
import { PipelineShell } from './components/PipelineShell';
import { WrapScreen } from './components/WrapScreen';
import { pipeline } from './data/pipeline';

function App() {
  const screen = useApp((s) => s.screen);

  return (
    <WindowChrome address="app.scribeup.com/optimize/goodco">
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full h-full min-h-0 overflow-hidden"
        >
          {screen === 'intro' && <IntroScreen pipeline={pipeline} />}
          {screen === 'pipeline' && <PipelineShell pipeline={pipeline} />}
          {screen === 'wrap' && <WrapScreen pipeline={pipeline} />}
        </motion.div>
      </AnimatePresence>
    </WindowChrome>
  );
}

export default App;
