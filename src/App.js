/* eslint-disable no-console */
import React, {Component} from 'react'
import moment from 'moment'
import {PropTypes} from 'prop-types'
import {Row, Col, Modal, Button, Input} from 'antd'
import Scheduler, {SchedulerData, ViewTypes, DnDSource, DemoData, DATE_FORMAT} from '../src/bigScheduler/index'
import {DnDTypes} from './data/DnDTypes'
import TaskItem from './data/TaskItem'
import TaskList from './data/TaskList'
import ResourceItem from './data/ResourceItem'
import ResourceList from './data/ResourceList'
import withDragDropContext from './withDnDContext'

class App extends Component {
    constructor(props) {
        super(props);
        let currDate = moment().format(DATE_FORMAT);
        let schedulerData = new SchedulerData(currDate, ViewTypes.Month, false, false, {
            schedulerMaxHeight: 500,
            views: [
                {viewName: 'Week View', viewType: ViewTypes.Week, showAgenda: false, isEventPerspective: false},
                {viewName: 'Month View', viewType: ViewTypes.Month, showAgenda: false, isEventPerspective: false},
            ]
        });
        schedulerData.localeMoment.locale('en');
        this.state = {
            modal: false,
            eventData: {
                title: '',
                start: undefined,
                end: undefined,
            },
            viewModel: schedulerData,
            taskDndSource: new DnDSource((props) => {
                return props.task;
            }, TaskItem, DnDTypes.TASK),
            resourceDndSource: new DnDSource((props) => {
                return props.resource;
            }, ResourceItem, DnDTypes.RESOURCE),
        }
    }

    showModal = () => {
        this.setState({
            modal: true,
        });
    }
    handleOk = (e) => {
        let schedulerData = this.state.eventData.schedulerData;
        let newFreshId = 0;
        let type = this.state.eventData.type;
        let item = this.state.eventData.item;
        schedulerData.events.forEach((item) => {
            if (item.id >= newFreshId)
                newFreshId = item.id + 1;
        });

        let newEvent = {
            id: newFreshId,
            title: this.state.eventData.title,
            start: this.state.eventData.start,
            end: this.state.eventData.end,
            resourceId: this.state.eventData.slotId,
            bgColor: this.state.eventData.bgColor,
            resizable: this.state.eventData.resizable
        }

        if (type === DnDTypes.RESOURCE) {
            newEvent = {
                ...newEvent,
                groupId: this.state.eventData.slotId,
                groupName: this.state.eventData.slotName,
                resourceId: item.id
            };
        }
        else if (type === DnDTypes.TASK) {
            newEvent = {
                ...newEvent,
                groupId: item.id,
                groupName: item.name
            };
        }

        let resource = schedulerData.getResourceById(this.state.eventData.slotId);
        // if(resource && resource.type === 'booking') {
        //     newEvent.removable = false;
        // } else {
        //     newEvent.removable = true;
        // }
        newEvent.removable = true;
        schedulerData.addEvent(newEvent);
        this.setState({
            viewModel: schedulerData,
            modal: false
        })
    }
    handleCancel = (e) => {
        this.setState({
            modal: false,
        });
    }

    render() {
        const {viewModel, taskDndSource, resourceDndSource} = this.state;
        let h3 = viewModel.isEventPerspective ? 'Drag and drop from outside: Drag a resource and drop to the task view' : 'Drag and drop from outside: Drag a task and drop to the resource view';
        let dndList = viewModel.isEventPerspective ? (
            <ResourceList schedulerData={viewModel} newEvent={this.newEvent} resourceDndSource={resourceDndSource}/>
        ) : (
            <TaskList schedulerData={viewModel} newEvent={this.newEvent} taskDndSource={taskDndSource}/>
        );

        //register the external DnDSources
        let dndSources = [taskDndSource, resourceDndSource];
        const renderDate = (date) => {
            if(date) {
                return moment(date).format('DD-MM-YYYY HH:mm');
            }
        }
        return (
            <div>
                <div>
                    <Row>
                        <Col span={20}>
                            <Scheduler schedulerData={viewModel}
                                       prevClick={this.prevClick}
                                       nextClick={this.nextClick}
                                       onSelectDate={this.onSelectDate}
                                       onViewChange={this.onViewChange}
                                       eventItemClick={this.eventClicked}
                                       viewEventClick={this.ops1}
                                       viewEventText="Xóa"
                                       viewEvent2Text=""
                                       viewEvent2Click={this.ops2}
                                       updateEventStart={this.updateEventStart}
                                       updateEventEnd={this.updateEventEnd}
                                       moveEvent={this.moveEvent}
                                       newEvent={this.newEvent}
                                       subtitleGetter={this.subtitleGetter}
                                       dndSources={dndSources}
                            />

                            <Modal title="Đặt lịch chạy xe"
                                   visible={this.state.modal}
                                   onOk={this.handleOk}
                                   onCancel={this.handleCancel}
                            >
                                <p><Input placeholder="Điềm bắt đầu - kết thúc" value={this.state.eventData.title}
                                        onChange={(e) => {
                                            let value = e.target.value;
                                            let eventData = this.state.eventData;
                                            eventData.title = value;
                                            this.setState({
                                                eventData: eventData
                                            });
                                        }
                                        }/></p>
                                <p><strong>Ngày bắt đầu: </strong> {renderDate(this.state.eventData.start)}</p>
                                <p><strong>Ngày kết thúc: </strong> {renderDate(this.state.eventData.end)}</p>
                            </Modal>
                        </Col>
                    </Row>
                </div>
            </div>
        )
    }

    prevClick = (schedulerData) => {
        schedulerData.prev();
        schedulerData.setEvents(schedulerData.getEvents());
        this.setState({
            viewModel: schedulerData
        })
    }

    nextClick = (schedulerData) => {
        schedulerData.next();
        schedulerData.setEvents(schedulerData.getEvents());
        this.setState({
            viewModel: schedulerData
        })
    }

    onViewChange = (schedulerData, view) => {
        schedulerData.setViewType(view.viewType, view.showAgenda, view.isEventPerspective);
        schedulerData.setEvents(schedulerData.getEvents());
        schedulerData.config.creatable = !view.isEventPerspective;
        this.setState({
            viewModel: schedulerData
        })
    }

    onSelectDate = (schedulerData, date) => {
        schedulerData.setDate(date);
        schedulerData.setEvents(schedulerData.getEvents());
        this.setState({
            viewModel: schedulerData
        })
    }

    eventClicked = (schedulerData, event) => {
        alert(`You just clicked an event: {id: ${event.id}, title: ${event.title}}`);
    };

    ops1 = (schedulerData, event) => {
        if (window.confirm('Bạn có muốn xóa ?')) {
            schedulerData._removeEvents(event);
            schedulerData.setEvents(schedulerData.getEvents());
            this.setState({
                viewModel: schedulerData
            })
        }
    };

    ops2 = (schedulerData, event) => {
        alert(`You just executed ops2 to event: {id: ${event.id}, title: ${event.title}}`);
    };

    newEvent = (schedulerData, slotId, slotName, start, end, type, item) => {
        let resource = schedulerData.getResourceById(slotId);
        let eventData = this.state.eventData;
        eventData.schedulerData = schedulerData;
        eventData.slotId = slotId;
        eventData.slotName = slotName;
        eventData.start = start;
        eventData.end = end;
        eventData.type = type;
        eventData.item = item;
        eventData.resizable = false;
        eventData.title = '';
        eventData.bgColor = resource.color;
        let self = this;
        this.setState({
            eventData: eventData
        }, function(){
            self.showModal();
        });
    }

    updateEventStart = (schedulerData, event, newStart) => {
        if (window.confirm(`Do you want to adjust the start of the event? {eventId: ${event.id}, eventTitle: ${event.title}, newStart: ${newStart}}`)) {
            schedulerData.updateEventStart(event, newStart);
        }
        this.setState({
            viewModel: schedulerData
        })
    }

    updateEventEnd = (schedulerData, event, newEnd) => {
        if (window.confirm(`Do you want to adjust the end of the event? {eventId: ${event.id}, eventTitle: ${event.title}, newEnd: ${newEnd}}`)) {
            schedulerData.updateEventEnd(event, newEnd);
        }
        this.setState({
            viewModel: schedulerData
        })
    }

    moveEvent = (schedulerData, event, slotId, slotName, start, end) => {
        if (window.confirm(`Do you want to move the event? {eventId: ${event.id}, eventTitle: ${event.title}, newSlotId: ${slotId}, newSlotName: ${slotName}, newStart: ${start}, newEnd: ${end}`)) {
            schedulerData.moveEvent(event, slotId, slotName, start, end);
            this.setState({
                viewModel: schedulerData
            })
        }
    }

    subtitleGetter = (schedulerData, event) => {
        return schedulerData.isEventPerspective ? schedulerData.getResourceById(event.resourceId).name : event.groupName;
    }
}

export default withDragDropContext(App);