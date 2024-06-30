import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import PostDetail from './pages/PostDetail';
import CreatePost from "./components/CreatePost";

function App() {
    return (
        <Router>
            <div className="App">
                <Header />
                <main className="container">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/post/:id" element={<PostDetail />} />
                        <Route path="/create-post" element={<CreatePost />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </Router>
    );
}



export default App;
