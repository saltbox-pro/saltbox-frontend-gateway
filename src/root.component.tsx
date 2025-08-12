import { BrowserRouter, Routes, Route } from "react-router";

export default function Root(props) {
  return (
    <BrowserRouter basename="/gate">
      <Routes>
        <Route path="/" element={<TestComponent />} />
      </Routes>
    </BrowserRouter>
  );
}

const TestComponent = () => {
  return <>asd</>;
};
