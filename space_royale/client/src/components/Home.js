import React from "react";
import "../App.css";


class Homepage extends React.Component {
    render() {
        return(
            <body>   
                <nav>
                    <ul>
                        <li>
                            <a href="/home">Homepage</a>
                        </li>
                    </ul>
                </nav>

                <header>
                    <h1>
                        Homepage
                    </h1>
                </header>

                <main>
                    <p>
                        Log in
                    </p>
                </main>
            </body>
        )
    }
}
class Home extends React.Component {
    render(){
        return (
            <div>
                <Homepage />
            </div>
        )
    }
}

export default Home;
