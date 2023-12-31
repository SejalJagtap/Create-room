import { ADD_PARTICIPANT,REMOVE_PARTICIPANT, SET_USER } from "./actiontypes";


let initialState={
    currentUser:null,
    participants:{},
};
export const reducer= (state=initialState,action)=>{
    switch(action.type){
        case SET_USER:{
            let {payload}=action;
            state={...state,currentUser:{...payload.currentUser}};
            return state
        }
        case ADD_PARTICIPANT:{
            let {payload}=action;
            let currentUserId=Object.keys(state.currentUser)[0];
            const participantId=Object.keys(payload.participant)[0];
            if(currentUserId===participantId){
                payload.participant[participantId].currentUser=true;
            }
            let participants={...state.participants,...payload.participant};
            state={...state,participants};

            return state;
        }
        case REMOVE_PARTICIPANT:{
            let {payload}=action;
            let participants={...state.participants}
            state={...state,currentUser:{...payload.currentUser}};
            delete participants[payload.participatKey]
            state={...state,participants};

            return state
        }
        default:{
            return state;
        }
        
    }
};