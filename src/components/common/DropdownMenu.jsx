import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';
import './DropdownMenu.css';

const DropdownMenu = ({
    items = [],
    icon = <MoreVertical size={20} />,
    buttonClassName = '',
    menuClassName = '',
    align = 'right' // 'left' or 'right'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleItemClick = (item) => {
        if (item.onClick) {
            item.onClick();
        }
        setIsOpen(false);
    };

    return (
        <div className="dropdown" ref={dropdownRef}>
            <button
                className={`icon-btn ${buttonClassName}`}
                onClick={() => setIsOpen(!isOpen)}
                title="Menu"
            >
                {icon}
            </button>

            {isOpen && (
                <div className={`dropdown-menu ${align === 'left' ? 'dropdown-menu-left' : ''} ${menuClassName}`}>
                    {items.map((item, index) => (
                        <React.Fragment key={index}>
                            {item.divider ? (
                                <div className="dropdown-divider" />
                            ) : (
                                <button
                                    className={`dropdown-item ${item.danger ? 'danger' : ''} ${item.className || ''}`}
                                    onClick={() => handleItemClick(item)}
                                    disabled={item.disabled}
                                    style={item.style}
                                >
                                    {item.icon && <span className="dropdown-item-icon">{item.icon}</span>}
                                    <span className="dropdown-item-label">{item.label}</span>
                                    {item.badge && <span className="dropdown-item-badge">{item.badge}</span>}
                                </button>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DropdownMenu;
