import Heading from "./components/Heading";
import Slider from "./components/Slider";
import Compress from "./components/Compress";
import HelpModal from "./components/HelpModal";

function App() {
  return (
    <div className="container my-4 text-center">
      <Heading />
      <HelpModal />
      <Compress />
    </div>
  );
}

export default App;
