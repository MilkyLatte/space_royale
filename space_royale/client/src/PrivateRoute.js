import React from "react";
import { Redirect, Route } from "react-router-dom";

function isValid(){
    fetch('/checkToken', {
        method: 'GET',
        body: {
            token: localStorage.getItem('JTW')
        },
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => {
        if (res.status === 200) {
            return true
        } else {
            return false
        }
    }).catch(err => {
        console.error(err);
    })
}

export const PrivateRoute = ({component: Component, ...rest}) => (
    <Route
    {...rest}
    render={props => 
        localStorage.getItem('JTW') ? (
            <Component {...props} />
        ) : (
            <Redirect
                to={{
                    pathname: "/login",
                    state: { from: props.location}
                }}
            />
        )
    }
    />
);