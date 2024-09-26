import React from 'react';
import SimpleCounter from './views/SimpleCounter';
import TodoList from './views/TodoList';
import NameCard from './views/NameCard';
import SdkServerComponent from './components/SdkServer';

function App() {

    return (
        <div className="App">
            <main className="container">

                {/* Please check /views/SimpleCounter.js for detail*/}
                <SimpleCounter/>

                <div className="divider"></div>

                {/* Please check /views/NameCard.js for detail*/}
                <NameCard/>

                <div className="divider"></div>

                {/* Please check /views/TodoList.js for detail*/}
                <TodoList/>
                <SdkServerComponent />
            </main>
        </div>
    );
}

export default App;
