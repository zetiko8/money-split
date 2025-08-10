import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

interface TaskListItem {
  id: string,
  isApplied: boolean,
}

@Component({
  standalone: true,
  imports: [
    CommonModule,
  ],
  selector: 'task-list',
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss',
})
export class TaskListComponent {
  @Input() tasks: TaskListItem[] = [];
  @Output() runTaskDown = new EventEmitter<TaskListItem>();
  @Output() runTaskUp = new EventEmitter<TaskListItem>();
  @Output() all = new EventEmitter<void>();
  @Output() allUnstaged = new EventEmitter<void>();
}
