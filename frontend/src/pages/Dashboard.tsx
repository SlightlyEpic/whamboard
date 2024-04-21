import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { useNavigate } from 'react-router-dom';

const charset = '0123456789abcdefghijklmnopqrstuvwxyz';
function randomRoomString() {
    let s = '';
    for(let i = 0; i < 12; i++) {
        s += charset[Math.floor(Math.random() * charset.length)];
    }
    return s;
}

const Dashboard: FC = () => {
    const { keycloak } = useKeycloak();
    const navigate = useNavigate();
    const [recentRooms, setRecentRooms] = useState<string[]>([]);
    const inviteCodeRef = useRef<HTMLInputElement>(null);

    const newRoom = useCallback(() => {
        const room = randomRoomString();
        setRecentRooms(rooms => {
            let newRooms = [...rooms];
            newRooms.unshift(room);
            newRooms = newRooms.slice(0, 16);
            return newRooms;
        });
        navigate(`/app/room/${randomRoomString()}`);
    }, [navigate]);
    
    const joinRoom = useCallback(() => {
        if(inviteCodeRef.current && inviteCodeRef.current.value.length === 12) {
            setRecentRooms(rooms => {
                let newRooms = [...rooms];
                newRooms.unshift(inviteCodeRef.current!.value);
                newRooms = newRooms.slice(0, 16);
                return newRooms;
            });
            navigate(`/app/room/${inviteCodeRef.current.value}`);
        } else {
            alert('Invalid invite code');
        }
    }, [navigate]);

    useEffect(() => {
        const storedRecentRooms = localStorage.getItem('recentRooms');
        if (storedRecentRooms) {
            try {
                setRecentRooms(JSON.parse(storedRecentRooms));
            } catch (err) {
                console.warn(err);
            }
        }

        return () => {
            localStorage.setItem('recentRooms', JSON.stringify(recentRooms));
        };
    }, []);

    return (
        <div>
            <h1 className='px-4 py-2 card w-100 d-flex flex-row justify-content-between'>
                <div>Dashboard</div>
                <button className='btn btn-danger' onClick={() => keycloak.logout()}>Logout</button>
            </h1>
            <div className='container mt-5'>
                <div className='row gap-4'>
                    <div className='col-md-4 bg-info rounded-2'>
                        <div className='mb-3' role='button' onClick={newRoom}>
                            <div className='card-body'>
                                
                                <h5 className='card-title'>Create New Whamboard</h5>
                                <p className='card-text'>Start with a fresh new board</p>
                            </div>
                        </div>
                    </div>
                    <div className='col-md-4 bg-secondary rounded-2'>
                        <div className='mb-3' role='button' onClick={joinRoom}>
                            <div className='card-body'>
                                <h5 className='card-title'>Join a Whamboard</h5>
                                <p className='card-text'>Join your friends using a code</p>
                            </div>
                        </div>
                    </div>
                    <input ref={inviteCodeRef} placeholder='Invite code' className='col-md-3 h-50  rounded-2 border-2 px-2' />
                </div>

                <h3 className='mt-5'>Recent rooms you joined:</h3>
                <div className='row'>
                    {recentRooms.length > 0 && recentRooms.map((room, index) => (
                        <div key={index} className='col-md-4'>
                            <div
                                className='card mb-3'
                                style={{ cursor: 'pointer' }}
                                onClick={() => navigate(`/app/room/${room}`)}
                            >
                                <div className='card-body'>
                                    <h5 className='card-title'>{room}</h5>
                                </div>
                            </div>
                        </div>
                    ))}
                    {!recentRooms.length && <div className='text-secondary'>Nothing here...</div>}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
