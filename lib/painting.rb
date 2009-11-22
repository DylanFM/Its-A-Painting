class Painting
  include DataMapper::Resource

  property :id,   Serial
  property :name, String, :nullable => false

  has n, :actions

end
