import * as React from 'react';
import {Component} from 'react';

export interface ITimeProps {
    time: string;
}

export class Time extends Component<ITimeProps> {
    private timer?: number;

    public componentDidMount() {
        this.timer = setInterval(this.tick.bind(this), 1000);
    }

    public tick() {
        this.forceUpdate();
    }

    public componentWillUnmount() {
        if (this.timer) {
            clearInterval(this.timer);
        }
        this.timer = undefined;
    }

    public render() {
        const {time} = this.props;
        let diff = new Date().valueOf() - new Date(time).valueOf();
        if (diff < 0) {
            // Future date shouldn't happen
            diff = 0;
        }
        let age;
        let timerInterval;
        const seconds = Math.trunc(diff / 1000);
        const minutes = Math.trunc(seconds / 60);
        const hours = Math.trunc(minutes / 60);
        const days = Math.trunc(hours / 24);
        if (days > 0) {
            age = days + 'd';
            timerInterval = 1000 * 60 * 60;
        } else if (hours > 0) {
            age = hours + 'h';
            timerInterval = 1000 * 60 * 15;
        } else if (minutes > 0) {
            age = minutes + 'min';
            timerInterval = 1000 * 15;
        } else {
            age = seconds + 's';
            timerInterval = 1000;
        }
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = setInterval(this.tick.bind(this), timerInterval);
        }
        return (
            <div className="time" title={time}>
                {age}
            </div>
        );
    }
}
