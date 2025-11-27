import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClickOutsideDirective } from '../../directives';

export interface NavLink {
  label: string;
  icon?: string;
}

export type DropdownItem = { label: string; icon?: string; divider?: false } | { divider: true };

@Component({
  selector: 'ui-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
})
export class NavbarComponent {
  @Input() appName = 'Click';
  @Input() username = '';
  @Input() avatarUrl: string | null = null;
  @Input() links: NavLink[] = [];
  @Input() dropdownItems: DropdownItem[] = [];

  @Output() logoClicked = new EventEmitter<void>();
  @Output() linkClicked = new EventEmitter<NavLink>();
  @Output() dropdownClicked = new EventEmitter<DropdownItem>();

  dropdownOpen = signal(false);
  mobileMenuOpen = signal(false);
  defaultAvatar = 'https://cdn-icons-png.flaticon.com/512/9131/9131529.png';

  closeDropdown(): void {
    this.dropdownOpen.set(false);
  }

  toggleDropdown(): void {
    this.dropdownOpen.set(!this.dropdownOpen());
  }

  dropdownClick(item: DropdownItem): void {
    this.dropdownClicked.emit(item);
    this.dropdownOpen.set(false);
  }
}
