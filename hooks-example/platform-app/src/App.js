import React from 'react';
import SimpleCounter from './views/SimpleCounter';
import TodoList from './views/TodoList';
import NameCard from './views/NameCard';
import SdkServerComponent from './components/SdkServer';
import ExtensionPoints from './components/ExtensionPoints';

function App() {

    return (
        <div className="App">
            <main className="container">
                <SimpleCounter/>
                <div className="divider"></div>
                <NameCard/>
                <div className="divider"></div>
                <ExtensionPoints/>
                <div className="divider"></div>
                <TodoList/>
                <SdkServerComponent />
            </main>
        </div>
    );
}

export default App;
