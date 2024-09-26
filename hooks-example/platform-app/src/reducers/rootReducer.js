import characterReducer from './characterReducer';
import counterReducer from './counterReducer';
import todoReducer from './todoReducer';
import extensibilityReducer from './extensibilityReducer';
import {combineReducers} from 'redux';

//Combine all the sub reducers
const rootReducer = combineReducers({
    characters: characterReducer,
    myCounter: counterReducer,
    todos:todoReducer,
    extensibility: extensibilityReducer
})

export default rootReducer