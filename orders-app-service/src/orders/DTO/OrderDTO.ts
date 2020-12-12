export class OrderDTO {
  constructor(
    public id: string,
    public createdDate: Date,
    public status: string,
    public amount: number,
  ) {}
}
