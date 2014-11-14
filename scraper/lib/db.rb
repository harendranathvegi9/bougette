require 'rest-firebase'
require 'digest/sha1'
require 'date'
require 'csv'

class DB
  def initialize(base_uri, uid, secret)
    @ref = RestFirebase.new(
      site: base_uri,
      d: {uid: uid},
      secret: secret
      )
  end

  def add(args)
    hash = Digest::MD5.hexdigest args.inspect
    account = args.delete(:account)
    date = args.delete(:date)
    credit = args.delete(:credit)
    name = args.delete(:name)
    memo = args.delete(:memo)
    amount = args.delete(:amount)
    response = @ref.patch("txns/#{hash}", {
      hash: hash,
      account: account,
      date: date,
      credit: credit,
      name: name,
      memo: memo,
      amount: amount
      })
    puts response
  end

  def import_csv(filename, account)
    CSV.foreach(filename, {:headers=>:first_row}) do |row|
      date = Date.strptime(row[0], "%m/%d/%Y")
      credit = row[1] == "CREDIT"
      name = row[2]
      memo = row[3]
      amount = row[4].to_f
      add(
        account: account,
        date: date,
        credit: credit,
        name: name,
        memo: memo,
        amount: amount
        )
    end
  end
end