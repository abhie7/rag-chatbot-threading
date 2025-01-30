from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from app.models.user import User, UserCreate, UserLogin, UserResponse
from app.services.auth import AuthService
from app.database import init_db

router = APIRouter()
# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate):
    existing_user = await User.find_one(User.email == user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = await AuthService.create_user(user)
    return UserResponse(**new_user.model_dump())

@router.post("/login")
async def login(user: UserLogin):
    authenticated_user = await AuthService.authenticate_user(user.email, user.password)
    if not authenticated_user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token = AuthService.create_access_token(data={"sub": authenticated_user.email})
    
    user_data = await User.find_one(User.email == user.email)
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")    
    
    return {"access_token": access_token, "token_type": "bearer", "avatar_seed": user_data.avatar_seed, "email": user.email, "display_name": user_data.display_name, "user_uuid": user_data.user_uuid, "documents": user_data.documents}

# @router.get("/me", response_model=UserResponse)
# async def get_current_user(token: str = Depends(oauth2_scheme)):
#     user = await AuthService.get_current_user(token)
#     return UserResponse(**user.model_dump())

