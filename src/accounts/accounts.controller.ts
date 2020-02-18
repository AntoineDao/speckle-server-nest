import { 
  Controller,
  Body,
  Get,
  Put,
  Post,
  Request,
  forwardRef,
  Inject,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  UnauthorizedException,
  Param,
  SerializeOptions,
  HttpException
 } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import { CreateAccount, CreateAccountResponse } from './dto/create.dto';
import { AuthService } from '../auth/auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AccountDto, LoginDto, AccountListDto, AccountGetOneDto, AccountPublicDto, PublicAccountList, AccountSearchDto } from './dto/account.dto';
import { AccountUpdateDto, AccountAdminUpdateDto, AccountUpdateResponse } from './dto/update.dto';

@ApiTags('Account')
@Controller('accounts')
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({
  excludeExtraneousValues: true
})
export class AccountsController {

  constructor(
    private readonly accountsService: AccountsService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) { }


  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async getAuthenticatedAccount(@Request() req): Promise<AccountDto> {
    let account
    try {
      account = await this.accountsService.findById(req.user._id);
    } catch (err){
      throw new HttpException({
        success: false,
        message: err.toString()
      }, 400)
    }

    return new AccountDto(account)
  }

  @Post('register')
  async createAccount(@Body() dto: CreateAccount): Promise<CreateAccountResponse> {
  
    let newAccount;
    
    try {
      newAccount = await this.accountsService.create(dto);
    } catch (err) {
      throw new HttpException({
        success: false,
        message: err.toString()
      }, 400)
    }


    return {
      success: true,
      message: 'User saved. Redirect to login.',
      resource: { 
        apitoken: newAccount.apitoken,
        token: this.authService.login(newAccount, '24h'),
        email: newAccount.email
      }
    }

  }

  @Post('login')
  async loginUser(@Body() dto: LoginDto) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    
    if (!user) {
      throw new UnauthorizedException();
    }

    return this.authService.login(user, '24h');
  }

  @Get('admin')
  @ApiBearerAuth()
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async getAllAccounts(): Promise<AccountListDto> {
    let users;
    let response = new AccountListDto()
    try {
      users = await this.accountsService.findAll()
      response.success = true;
      response.resources = users.map(user => new AccountDto(user))
    } catch (err) {
      response.success = false;
      response.resources = [];
      response.message = err.toString()

      throw new HttpException(response, 400)
    }
    return response;
  }

  @Put()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async updateAccount(@Body() dto: AccountUpdateDto, @Request() req: any): Promise<AccountUpdateResponse> {
    let response = new AccountUpdateResponse();

    try {
      await this.accountsService.updateAccount(req.user._id, dto)
      response.success = true
      response.message = 'User profile updated.'
    } catch (err) {
      response.success = false;
      response.message = err.toString()

      throw new HttpException(response, 400)
    }

    return response;
  }

  @Get(':id')
  @ApiParam({name: 'id'})
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async getAccountById(@Param() param): Promise<AccountGetOneDto> {

    let response = new AccountGetOneDto();

    try {
      const res = await this.accountsService.findById(param.id);
      console.log(res)
      response.resource = new AccountPublicDto(res);
      response.success = true;
    } catch (err) {
      response.success = false;
      response.message = err.toString()

      throw new HttpException(response, 400)
    }

    return response
  }

  @Put(':id')
  @ApiParam({ name: 'id' })
  @ApiBearerAuth()
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async updateAccountById(@Param() param, @Body() dto: AccountAdminUpdateDto): Promise<AccountUpdateResponse> {

    let response = new AccountUpdateResponse();

    try {
      await this.accountsService.updateAccount(param.id, dto)
      response.success = true
      response.message = 'User profile updated.'
    } catch (err) {
      response.success = false;
      response.message = err.toString()

      throw new HttpException(response, 400)
    }

    return response;
  }

  @Post('search')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async searchAccount(@Body() dto: AccountSearchDto): Promise<PublicAccountList> {
    let response = new PublicAccountList();

    try {
      const accounts = await this.accountsService.search(dto.searchString)
      response.success = true;
      response.resources = accounts.map(account => new AccountPublicDto(account))
    } catch(err) {
      response.success = false;
      response.message = err.toString()

      throw new HttpException(response, 400)
    }

    return response;
  }


}
